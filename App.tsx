import { useEffect, useState } from 'react';
import RNBootSplash from "react-native-bootsplash";
import JailMonkey from 'jail-monkey';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeSecureStorage } from './src/store/storage';
import CustomToast from './src/components/CustomToast';
import { Toast } from './src/utils/ToastManager';
import colors from './src/styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AuthInjector from './src/components/AuthInjector';
import NotificationService from './src/utils/NotificationService';
import NetworkBanner from './src/components/NetworkBanner';
import { Text, TextInput, View, TouchableOpacity, BackHandler, StatusBar } from 'react-native';
import { useSystemStore } from './src/store/useSystemStore';
import ZendeskService from './src/utils/ZendeskService';
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';
import strings from './src/constants/strings';
import { devDebugger } from '@utils/devDebugger';

// Disable all devDebugger logs in production for security and performance
if (!__DEV__) {
  devDebugger.log = () => { };
  devDebugger.info = () => { };
  devDebugger.warn = () => { };
  devDebugger.error = () => { };
}

// Disable font scaling
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

function App() {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isDeviceCompromised, setIsDeviceCompromised] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check for in-app updates when the app starts
    const checkForUpdate = async () => {
      try {
        // Initialize the SpInAppUpdates module. 
        // Passing 'false' means we are not in debug mode.
        const inAppUpdates = new SpInAppUpdates(false);
        const updateResponse = await inAppUpdates.checkNeedsUpdate();

        // If there's an update available in the store
        if (updateResponse.shouldUpdate) {
          let updateOptions: StartUpdateOptions;

          if (Platform.OS === 'android') {
            // Android allows for an IMMEDIATE or FLEXIBLE update.
            // IMMEDIATE forces a full-screen update UI.
            updateOptions = {
              updateType: IAUUpdateKind.FLEXIBLE,
            };
          } else {
            // iOS displays a native alert prompt with the configured strings
            updateOptions = {
              title: 'Update Available',
              message: 'A new version of the app is available. Please update to continue using the app.',
              buttonUpgradeText: 'Update Now',
              forceUpgrade: true, // Use forceUpgrade for immediate updates on iOS
            };
          }

          // Trigger the update prompt
          inAppUpdates.startUpdate(updateOptions);
        }
      } catch (error) {
        devDebugger.error('Error checking for updates:', error);
      }
    };

    checkForUpdate();

    const init = async () => {
      let developerMode = false;

      if (Platform.OS === 'android') {
        try {
          developerMode = await JailMonkey.isDevelopmentSettingsMode();
        } catch (e) {
          devDebugger.warn('Failed to check development settings:', e);
          developerMode = false;
        }
      }

      const isDebugged = await JailMonkey.isDebuggedMode?.() ?? false;

      const isCompromised =
        !__DEV__ &&
        (
          JailMonkey.isJailBroken() ||
          JailMonkey.canMockLocation() ||
          isDebugged ||
          developerMode
        );

      if (isCompromised) {
        setIsDeviceCompromised(true);
        if (developerMode || isDebugged) {
          setIsDevMode(true);
        }
        await RNBootSplash.hide({ fade: true });
        return;
      }

      // Initialize MMKV encrypted storage first
      await initializeSecureStorage();
      setIsStorageReady(true);

      // Initialize Zendesk Messaging service on startup
      ZendeskService.initialize().catch(err => {
        devDebugger.error("Failed to initialize Zendesk Service on startup:", err);
      });
    };

    init().finally(async () => {
      await RNBootSplash.hide({ fade: true });
      devDebugger.log("Bootsplash hidden");

      // Initialize Push Notifications asynchronously so it doesn't block splash screen dismissal
      NotificationService.initialize().catch(err => {
        devDebugger.error("Failed to initialize NotificationService:", err);
      });
    });
    // Refresh unread notifications count when app returns to active foreground.
    // Note: The store's fetchUnreadCount method automatically handles rate-limiting (1.5s cooldown) and concurrency protection.
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        useSystemStore.getState().fetchUnreadCount().catch(err => {
          devDebugger.error("Failed to fetch unread count on app foreground:", err);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isDeviceCompromised) {
    if (isDevMode) {
      return (
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: horizontalScale(24), paddingTop: verticalScale(60), paddingBottom: verticalScale(30) }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: fontSize(26), color: colors.textDark || '#1F2937', marginBottom: verticalScale(20), textAlign: 'center' }}>
                  {strings.security.debugTitle}
                </Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: fontSize(16), color: '#4B5563', textAlign: 'center', lineHeight: verticalScale(24), marginBottom: verticalScale(24) }}>
                  {strings.security.debugWarning}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: fontSize(15), color: '#6B7280', textAlign: 'center', lineHeight: verticalScale(22), paddingHorizontal: horizontalScale(10) }}>
                  {strings.security.debugSteps}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => BackHandler.exitApp()}
                activeOpacity={0.8}
                style={{
                  width: '100%',
                  backgroundColor: colors.primary,
                  paddingVertical: verticalScale(16),
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.semiBold, color: colors.white, fontSize: fontSize(16) }}>
                  {strings.security.closeApp}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: horizontalScale(24), paddingTop: verticalScale(60), paddingBottom: verticalScale(30) }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontSize(26), color: colors.textDark || '#1F2937', marginBottom: verticalScale(20), textAlign: 'center' }}>
                {strings.security.alertTitle}
              </Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: fontSize(16), color: '#4B5563', textAlign: 'center', lineHeight: verticalScale(24) }}>
                {strings.security.jailbrokenWarning}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => BackHandler.exitApp()}
              activeOpacity={0.8}
              style={{
                width: '100%',
                backgroundColor: colors.primary,
                paddingVertical: verticalScale(16),
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: fonts.semiBold, color: colors.white, fontSize: fontSize(16) }}>
                {strings.security.closeApp}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!isStorageReady) {
    return null; // Wait for secure storage before rendering the app tree
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={Platform.OS === 'android' ? ['bottom'] : []}>
        <View style={{ flex: 1 }}>
          <AuthProvider>
            <AuthInjector />
            <RootNavigator />
          </AuthProvider>
          <NetworkBanner />
        </View>
      </SafeAreaView>
      <CustomToast ref={(ref: any) => Toast.setInstance(ref)} />
    </SafeAreaProvider>
  );
}

export default App;
