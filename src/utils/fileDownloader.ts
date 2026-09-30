import { Platform, Alert, Linking } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Toast } from '@utils/ToastManager';
import { getToken } from '@store/storage';
import strings from '@constants/strings';
import { devDebugger } from '@utils/devDebugger';

/**
* Request necessary permissions for downloading files.
* - iOS: no explicit permission needed for app's Documents directory.
* - Android < 13: requires WRITE_EXTERNAL_STORAGE.
* - Android >= 13: uses MediaStore; no runtime permission needed.
*/
const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
        return true;
    }

    try {
        const androidVersion = Number(Platform.Version);

        if (androidVersion >= 30) {
            return true;
        }

        const result = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

        if (result === RESULTS.GRANTED) {
            return true;
        }

        const requestResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

        if (requestResult === RESULTS.GRANTED) {
            return true;
        }

        if (requestResult === RESULTS.UNAVAILABLE) {
            // Fallback to request permission directly if unavailable
            const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            if (result === RESULTS.GRANTED) {
                return true;
            }
            return false;
        }

        if (requestResult === RESULTS.BLOCKED) {
            Alert.alert(
                strings.common.fileDownloader.permissionRequired,
                strings.common.fileDownloader.storagePermissionMessage,
                [
                    { text: strings.common.cancel, style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
        }

        return false;
    } catch (err) {
        devDebugger.error('Permission error:', err);
        return false;
    }
};

/**
* Downloads an invoice PDF and saves it to a user-visible location:
*
* Android → Downloads/<fileName>
*   • Scanned into MediaStore so it appears in Files/Downloads immediately.
*   • Opens with an ACTION_VIEW intent (any installed PDF viewer).
*
* iOS → <AppDocuments>/<fileName>
*   • The app's Documents directory is already exposed in the Files app
*     under "On My iPhone/iPad → <AppName>" with no extra configuration.
*   • Opens with iOS Quick Look (previewDocument).
*
* @param url      - Authenticated download URL for the invoice PDF.
* @param fileName - Desired file name, e.g. "invoice-2024-001.pdf".
* @returns        - true on success, false on failure/permission denial.
*/
export const downloadInvoice = async (url: string, fileName: string): Promise<string | false> => {

    // 1. Ensure the file name ends with .pdf
    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    // 2. Check / request storage permission
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
        return false;
    }

    // 3. Fetch the auth token
    const token = await getToken();

    const { dirs } = ReactNativeBlobUtil.fs;

    try {
        /* ------------------------------------------------------------------ */
        /*  ANDROID                                                             */
        /* ------------------------------------------------------------------ */
        if (Platform.OS === 'android') {
            /**
             * Save directly into the public Downloads folder.
             * This path is visible in any file manager under "Downloads".
             */
            const destPath = `${dirs.DownloadDir}/${safeFileName}`;

            const res = await ReactNativeBlobUtil.config({
                fileCache: false,   // write straight to destPath, no temp file
                path: destPath,
                addAndroidDownloads: {
                    /**
                     * addAndroidDownloads registers the file with the Android
                     * DownloadManager so it shows up in "Downloads" immediately,
                     * complete with a system notification.
                     */
                    useDownloadManager: true,
                    notification: true,
                    title: safeFileName,
                    description: strings.common.fileDownloader.invoicePdf,
                    mime: 'application/pdf',
                    mediaScannable: true,       // triggers MediaStore scan
                    path: destPath,
                },
            }).fetch('GET', url, {
                Authorization: `Bearer ${token}`,
            });

            const savedPath = res.path();

            // Extra safety: also run a manual mediascan in case DownloadManager
            // does not trigger it (observed on some Android 10 devices).
            try {
                await ReactNativeBlobUtil.fs.scanFile([
                    { path: savedPath, mime: 'application/pdf' },
                ]);
            } catch (scanErr) {
                devDebugger.warn('====== scanFile warning ======', scanErr);
            }

            // Open the file immediately with the device's default PDF viewer.
            // We comment out the automatic actionViewIntent since we want to trigger it from the "Open" button in the popup instead.
            // ReactNativeBlobUtil.android.actionViewIntent(savedPath, 'application/pdf');

            return savedPath;
        }

        /* ------------------------------------------------------------------ */
        /*  iOS                                                                 */
        /* ------------------------------------------------------------------ */
        /**
         * Save to the app's Documents directory.
         *
         * iOS exposes this folder in the native Files app automatically:
         *   Files → On My iPhone/iPad → <Your App Name> → <file>
         *
         * No additional Info.plist key is needed for this path.
         * (UIFileSharingEnabled and LSSupportsOpeningDocumentsInPlace make the
         *  folder editable by the user; add them to Info.plist if desired.)
         */
        const destPath = `${dirs.DocumentDir}/${safeFileName}`;

        // Remove any stale copy so the fetch does not fail with "file exists".
        const exists = await ReactNativeBlobUtil.fs.exists(destPath);
        if (exists) {
            await ReactNativeBlobUtil.fs.unlink(destPath);
        }

        const res = await ReactNativeBlobUtil.config({
            fileCache: false,   // write straight to destPath
            path: destPath,
        }).fetch('GET', url, {
            Authorization: `Bearer ${token}`,
        });

        const savedPath = res.path();

        // Preview with iOS Quick Look — lets the user share / AirDrop / print.
        // We comment out automatic previewDocument since we want to trigger it from the "Open" button in the popup.
        // ReactNativeBlobUtil.ios.previewDocument(savedPath);

        return savedPath;
    } catch (error) {
        devDebugger.error('Download error:', error);
        Toast.show({
            type: 'error',
            text2: strings.common.fileDownloader.downloadFailed,
        });
        return false;
    }
};