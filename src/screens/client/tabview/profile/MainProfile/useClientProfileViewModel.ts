import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import { useAuth } from '@context/AuthContext';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import AuthService from '@config/authService';
import DeviceInfo from 'react-native-device-info';
import strings from '@strings';
import { rateApp } from '@utils/rateUtils';
import { handleNotificationToggleLogic, checkNotificationPermission } from '@utils/notificationUtils';
import { RESULTS } from 'react-native-permissions';
import ZendeskService from '@utils/ZendeskService';
import NetInfo from '@react-native-community/netinfo';
import { Toast } from '@utils/ToastManager';
import * as Storage from '@store/storage';
import { devDebugger } from '@utils/devDebugger';
import { encryptPin } from '@utils/cryptoUtils';

export type ClientProfileNavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'ClientTabBar'>;

export const useClientProfileViewModel = () => {
  const navigation = useNavigation<ClientProfileNavigationProp>();
  const { signOut } = useAuth();
  const { clientProfile, setClientProfile } = useUserStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Fetch latest profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      AuthService.getClientProfile()
        .then((res: any) => {
          const data = res?.data || res?.results;
          if (res?.success && data) {
            setClientProfile(data);
          }
        })
        .catch((err: any) => {
          devDebugger.log('Error fetching client profile in ClientProfileScreen:', err);
        });
    }, [setClientProfile])
  );

  const isPinSetFully = checkIsPinSet(clientProfile);

  // Create Transaction PIN states
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [setPinError, setSetPinError] = useState<string | undefined>(undefined);

  // Change Transaction PIN states
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [changePinError, setChangePinError] = useState<string | undefined>(undefined);

  // Reset Transaction PIN states
  const [showResetPinModal, setShowResetPinModal] = useState(false);

  const handleForgetPinPress = () => {
    navigation.navigate('ForgetTransactionPin');
  };
  const handleResetPinPress = handleForgetPinPress;

  const handleResetPinSuccess = () => {
    if (clientProfile) {
      setClientProfile({
        ...clientProfile,
        isPIN: true,
        isPINSet: true,
        user: { ...clientProfile.user, isPIN: true, isPINSet: true },
        profile: { ...clientProfile.profile, isPIN: true, isPINSet: true },
      } as any);
    }
  };

  const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
    setIsSettingPin(true);
    setSetPinError(undefined);
    try {
      const encPin = encryptedPin || encryptPin(pin).encryptedPin;
      devDebugger.log('🔐 [Client Profile] Setting transaction PIN:', { pin, encryptedPin: encPin });
      const response = await AuthService.setTransactionPin({
        transactionPin: encPin,
      });

      if (response.success) {
        setShowSetPinModal(false);
        setSetPinError(undefined);
        Toast.show({
          type: 'success',
          text2: response.message || strings.transactionPin.setSuccess,
        });
        useUserStore.getState().setHasDismissedPinPrompt(true);
        if (clientProfile) {
          setClientProfile({
            ...clientProfile,
            isPIN: true,
            isPINSet: true,
            user: { ...clientProfile.user, isPIN: true, isPINSet: true },
            profile: { ...clientProfile.profile, isPIN: true, isPINSet: true },
          } as any);
        }
      } else {
        const errorMsg = response.message || strings.transactionPin.setFailed;
        setSetPinError(errorMsg);
        Toast.show({
          type: 'error',
          text2: errorMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [Client Profile] Error setting PIN:', error);
      const errorMsg = error?.message || strings.transactionPin.setFailed;
      setSetPinError(errorMsg);
      Toast.show({
        type: 'error',
        text2: errorMsg,
      });
    } finally {
      setIsSettingPin(false);
    }
  };

  const handleChangePinComplete = async ({
    currentPin,
    newPin,
    encryptedCurrentPin,
    encryptedNewPin,
  }: {
    currentPin: string;
    newPin: string;
    encryptedCurrentPin: string;
    encryptedNewPin: string;
  }) => {
    if (currentPin && newPin && currentPin === newPin) {
      Toast.show({
        type: 'error',
        text2: strings.client.profile.sameTransactionPinError,
      });
      return;
    }

    setChangePinError(undefined);
    setIsChangingPin(true);
    try {
      devDebugger.log('🔐 [Client Profile] Changing transaction PIN...');
      const response = await AuthService.changeTransactionPin({
        currentPin: encryptedCurrentPin,
        newPin: encryptedNewPin,
      });

      if (response.success) {
        setShowChangePinModal(false);
        setChangePinError(undefined);
        Toast.show({
          type: 'success',
          text2: response.message || strings.client.profile.changePinSuccess,
        });
        if (clientProfile) {
          setClientProfile({
            ...clientProfile,
            isPIN: true,
            isPINSet: true,
            user: { ...clientProfile.user, isPIN: true, isPINSet: true },
            profile: { ...clientProfile.profile, isPIN: true, isPINSet: true },
          } as any);
        }
      } else {
        const errorMsg = response.message || strings.client.profile.changePinFailed;
        setChangePinError(errorMsg);
        Toast.show({
          type: 'error',
          text2: errorMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [Client Profile] Error changing PIN:', error);
      const errorMsg = error?.message || strings.client.profile.changePinFailed;
      setChangePinError(errorMsg);
      Toast.show({
        type: 'error',
        text2: errorMsg,
      });
    } finally {
      setIsChangingPin(false);
    }
  };

  // Check real notification permission state on mount
  useEffect(() => {
    checkNotificationPermission().then((status) => {
      const isSystemGranted = status === RESULTS.GRANTED;
      const isAppSettingEnabled = Storage.getNotificationEnabled();
      setNotificationsEnabled(isSystemGranted && isAppSettingEnabled);
    });
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    await handleNotificationToggleLogic(
      value,
      setNotificationLoading,
      (val) => {
        setNotificationsEnabled(val);
        Storage.setNotificationEnabled(val);
      },
      async (enabled, deviceToken, deviceType) => {
        if (enabled) {
          if (deviceToken && deviceType) {
            try {
              const deviceId = await DeviceInfo.getUniqueId();
              const fcmRes = await AuthService.updateFcmToken(deviceToken, deviceType, deviceId);
              if (fcmRes.success) {
                return await AuthService.updateNotificationSettings(true);
              } else {
                devDebugger.log('[Notifications] FCM Token update failed:', fcmRes.message);
                throw new Error(fcmRes.message || 'Failed to update FCM token');
              }
            } catch (err) {
              devDebugger.error('[Notifications] Error updating FCM token:', err);
              throw err;
            }
          } else {
            return await AuthService.updateNotificationSettings(true);
          }
        } else {
          return await AuthService.updateNotificationSettings(false);
        }
      }
    );
  };

  const handleOpenSupport = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Toast.showError(strings.common.noInternetConnection);
      return;
    }
    const name = clientProfile?.user?.fullname || clientProfile?.profile?.contactPersonName || 'User';
    const email = clientProfile?.user?.email || 'user@example.com';
    await ZendeskService.openTicketHistory(name, email);
  };

  const handlePinSettingPress = () => {
    if (isPinSetFully) {
      setChangePinError(undefined);
      setShowChangePinModal(true);
    } else {
      setSetPinError(undefined);
      setShowSetPinModal(true);
    }
  };

  const displayName = clientProfile?.user?.fullname || clientProfile?.profile?.contactPersonName || 'User';
  const profileImageUrl = clientProfile?.user?.profileImageUrl;

  return {
    clientProfile,
    displayName,
    profileImageUrl,
    imageLoading,
    imageError,
    setImageLoading,
    setImageError,
    notificationsEnabled,
    notificationLoading,
    handleNotificationToggle,
    logoutVisible,
    setLogoutVisible,
    deleteVisible,
    setDeleteVisible,
    isPinSetFully,
    showSetPinModal,
    setShowSetPinModal,
    isSettingPin,
    setPinError,
    setSetPinError,
    handleSetPinComplete,
    showChangePinModal,
    setShowChangePinModal,
    isChangingPin,
    changePinError,
    setChangePinError,
    handleChangePinComplete,
    showResetPinModal,
    setShowResetPinModal,
    handleForgetPinPress,
    handleResetPinPress,
    handleResetPinSuccess,
    userEmail: clientProfile?.user?.email || '',
    handlePinSettingPress,
    handleOpenSupport,
    navigateToProfileDetails: () => navigation.navigate('ClientProfileDetails'),
    navigateToRatings: () => navigation.navigate('Ratings'),
    navigateToDrafts: () => navigation.navigate('Drafts'),
    navigateToPaymentMethod: () => navigation.navigate('PaymentMethod'),
    navigateToChangePassword: () => navigation.navigate('ChangePassword'),
    navigateToForgetTransactionPin: () => navigation.navigate('ForgetTransactionPin'),
    navigateToAboutUs: () => navigation.navigate('Information', { type: 'about' }),
    navigateToFaq: () => navigation.navigate('FAQ'),
    navigateToTerms: () => navigation.navigate('Information', { type: 'terms' }),
    navigateToPrivacy: () => navigation.navigate('Information', { type: 'privacy' }),
    rateApp,
    signOut,
  };
};
