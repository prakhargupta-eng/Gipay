/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

import { devDebugger } from './src/utils/devDebugger';
// import { initSslPinning } from './src/config/sslPinningService';

// // Initialize SSL Pinning
// initSslPinning();

if (!__DEV__) {
    devDebugger.log = () => { };
    devDebugger.info = () => { };
    devDebugger.warn = () => { };
    devDebugger.error = () => { };
}

import NotificationService from './src/utils/NotificationService';

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
    devDebugger.log('Message handled in the background!', remoteMessage);
    // On iOS, APNs automatically presents remote notifications that have a notification payload.
    // Displaying via Notifee on iOS creates a duplicate notification.
    if (Platform.OS === 'android') {
        await NotificationService.displayIncomingNotification(remoteMessage);
    }
});

import notifee, { EventType } from '@notifee/react-native';
import { getIsLoggedIn, getUserId, getUserType, initializeSecureStorage } from './src/store/storage';
import { handleNotificationAction } from './src/utils/notificationUtils';

notifee.onBackgroundEvent(async ({ type, detail }) => {
    // CRITICAL: Ensure secure storage is initialized if the app was killed and woken up in the background
    await initializeSecureStorage();

    if (type === EventType.PRESS && detail.notification) {
        devDebugger.log('Notifee background notification pressed', detail.notification);
        const data = detail.notification.data;
        if (data) {
            const isLoggedIn = getIsLoggedIn();
            if (isLoggedIn) {
                const userId = getUserId() || null;
                const userType = getUserType() || null;
                handleNotificationAction(data, userId, userType);
            }
        }
    }
});

AppRegistry.registerComponent(appName, () => App);
