import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import {
  pick,
  types,
  errorCodes,
  isErrorWithCode,
} from '@react-native-documents/picker';
import { devDebugger } from '@utils/devDebugger';

export { types };


export interface PickedDocument {
  uri: string;
  name: string | null;
  type: string | null;
  size: number | null;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MIN_FILE_SIZE = 10 * 1024; // 10KB

const ALLOWED_TYPES = [
  types.pdf,
  types.doc,
  types.docx,
  types.images,
];

/**
 * Validates the filename for special characters.
 * Allows letters, numbers, spaces, and common symbols.
 */
const isValidFileName = (name: string | null): boolean => {
  if (!name) return true;
  // Allow almost everything except very dangerous characters
  const regex = /^[^<>:"/\\|?*]+$/;
  return regex.test(name);
};

/**
 * Checks and requests permissions on Android.
 * Note: Modern Android versions (13+) don't require READ_EXTERNAL_STORAGE for picking files via SAF.
 */
const requestAndroidPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  // For Android 13+ (API 33+), we don't need to request READ_EXTERNAL_STORAGE for the document picker.
  if (Platform.Version >= 33) {
    return true;
  }

  // For older versions, we still request it just in case, but many pickers work without it.
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'GigPay needs access to your storage to upload documents.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    devDebugger.warn('[DocumentPicker] Permission request error:', err);
    return false;
  }
};

/**
 * Opens the native file picker to select a document.
 * @param options configuration object including allowedTypes, minSize, and maxSize
 */
export const pickDocument = async (options?: {
  allowedTypes?: string[];
  minSize?: number;
  maxSize?: number;
}): Promise<PickedDocument | null> => {
  const { allowedTypes, minSize = DEFAULT_MIN_FILE_SIZE, maxSize = DEFAULT_MAX_FILE_SIZE } = options || {};
  // 1. Check/Ask Permission
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission && Platform.OS === 'android') return null;

  try {
    const results = await pick({
      type: allowedTypes || ALLOWED_TYPES,
      copyTo: 'cachesDirectory',
    });

    // pick() returns an array. We take the first one.
    if (!results || results.length === 0) return null;
    const result = results[0];

    // 2. Validate Size
    if (result.size) {
      if (result.size > maxSize) {
        const readableMax = maxSize >= 1024 * 1024 ? `${(maxSize / (1024 * 1024)).toFixed(1)}MB` : `${(maxSize / 1024).toFixed(0)}KB`;
        throw new Error(`File too large. Please select a file smaller than ${readableMax}.`);
      }
      if (result.size < minSize) {
        const readableMin = minSize >= 1024 * 1024 ? `${(minSize / (1024 * 1024)).toFixed(1)}MB` : `${(minSize / 1024).toFixed(0)}KB`;
        throw new Error(`File too small. Please select a file larger than ${readableMin}.`);
      }
    }

    // // 3. Validate Filename characters
    // if (!isValidFileName(result.name)) {
    //   throw new Error('Invalid filename. Only letters, numbers, "_", and "-" are allowed.');
    // }

    return {
      uri: result.uri,
      name: result.name,
      type: result.type,
      size: result.size,
    };
  } catch (err: any) {
    if (isErrorWithCode(err)) {
      if (err.code === errorCodes.OPERATION_CANCELED) {
        return null;
      }
      if (err.code === errorCodes.IN_PROGRESS) {
        return null;
      }
    }

    // Re-throw if it's one of our validation errors
    if (err instanceof Error && (
      err.message.includes('too large') ||
      err.message.includes('too small') ||
      err.message.includes('Invalid filename')
    )) {
      throw err;
    }

    // Permission denied or other error
    const isPermissionError =
      err?.message?.toLowerCase().includes('permission') ||
      err?.code === 'DOCUMENT_PICKER_ERROR' ||
      err?.message?.toLowerCase().includes('denied');

    if (isPermissionError) {
      showPermissionDeniedAlert();
      return null;
    }

    throw new Error('Something went wrong while picking the document.');
  }
};

/**
 * Opens the native file picker to select multiple documents.
 */
export const pickMultipleDocuments = async (options?: {
    allowedTypes?: string[];
    minSize?: number;
    maxSize?: number;
}): Promise<PickedDocument[]> => {
    const { allowedTypes, minSize = DEFAULT_MIN_FILE_SIZE, maxSize = DEFAULT_MAX_FILE_SIZE } = options || {};
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission && Platform.OS === 'android') return [];

  try {
    const results = await pick({
      type: allowedTypes || ALLOWED_TYPES,
      copyTo: 'cachesDirectory',
      allowMultiSelection: true,
    });

    if (!results || results.length === 0) return [];

    const validatedResults: PickedDocument[] = [];

    for (const result of results) {
        // Validate Size
        if (result.size) {
          if (result.size > maxSize) {
            const readableMax = maxSize >= 1024 * 1024 ? `${(maxSize / (1024 * 1024)).toFixed(1)}MB` : `${(maxSize / 1024).toFixed(0)}KB`;
            throw new Error(`File "${result.name}" is too large. Please select files smaller than ${readableMax}.`);
          }
        }

        // Validate Filename
        if (!isValidFileName(result.name)) {
          throw new Error(`Invalid filename for "${result.name}".`);
        }

        validatedResults.push({
          uri: result.uri,
          name: result.name,
          type: result.type,
          size: result.size,
        });
    }

    return validatedResults;
  } catch (err: any) {
    if (isErrorWithCode(err)) {
      if (err.code === errorCodes.OPERATION_CANCELED) return [];
    }
    throw err;
  }
};

/**
 * Shows an alert prompting the user to open Settings.
 */
const showPermissionDeniedAlert = () => {
  Alert.alert(
    'Permission Required',
    'File access permission is required to upload documents. Please enable it in Settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};
