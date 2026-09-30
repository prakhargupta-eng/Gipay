import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import { useAuth } from '@context/AuthContext';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import DeviceInfo from 'react-native-device-info';
import strings from '@constants/strings';
import { rateApp } from '@utils/rateUtils';
import { handleNotificationToggleLogic, checkNotificationPermission } from '@utils/notificationUtils';
import { RESULTS } from 'react-native-permissions';
import ZendeskService from '@utils/ZendeskService';
import NetInfo from '@react-native-community/netinfo';
import { Toast } from '@utils/ToastManager';
import * as Storage from '@store/storage';
import { devDebugger } from '@utils/devDebugger';
import { encryptPin } from '@utils/cryptoUtils';
import FastImage from 'react-native-fast-image';

export type ContractorProfileNavigationProp = NativeStackNavigationProp<ContractorAppStackParamList>;

export const useContractorProfileViewModel = () => {
  const navigation = useNavigation<ContractorProfileNavigationProp>();
  const { userId } = useAuth();
  const { profile, setProfile } = useUserStore();
  const { settings, fetchSettings } = useSystemStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Fetch latest contractor profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      ContractorService.getProfileInfo(userId)
        .then((res: any) => {
          const data = res?.data || res?.results;
          if (res?.success && data) {
            setProfile(data);
          }
        })
        .catch((err: any) => {
          devDebugger.log('Error fetching contractor profile in ProfileScreen:', err);
        });
    }, [userId, setProfile])
  );

  const isPinSetFully = checkIsPinSet(profile);

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
    if (profile) {
      setProfile({
        ...profile,
        isPIN: true,
        isPINSet: true,
        user: { ...profile.user, isPIN: true, isPINSet: true },
        profile: { ...profile.profile, isPIN: true, isPINSet: true },
      } as any);
    }
  };

  const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
    setIsSettingPin(true);
    setSetPinError(undefined);
    try {
      const encPin = encryptedPin || encryptPin(pin).encryptedPin;
      devDebugger.log('🔐 [Contractor Profile] Setting transaction PIN:', { pin, encryptedPin: encPin });
      const response = await ContractorService.setTransactionPin({
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
        if (profile) {
          setProfile({
            ...profile,
            isPIN: true,
            isPINSet: true,
            user: { ...profile.user, isPIN: true, isPINSet: true },
            profile: { ...profile.profile, isPIN: true, isPINSet: true },
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
      devDebugger.log('❌ [Contractor Profile] Error setting PIN:', error);
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
        text2: strings.transactionPin.samePinError,
      });
      return;
    }

    setChangePinError(undefined);
    setIsChangingPin(true);
    try {
      devDebugger.log('🔐 [Contractor Profile] Changing transaction PIN...');
      const response = await ContractorService.changeTransactionPin({
        currentPin: encryptedCurrentPin,
        newPin: encryptedNewPin,
      });

      if (response.success) {
        setShowChangePinModal(false);
        setChangePinError(undefined);
        Toast.show({
          type: 'success',
          text2: response.message || strings.transactionPin.changeSuccess,
        });
        if (profile) {
          setProfile({
            ...profile,
            isPIN: true,
            isPINSet: true,
            user: { ...profile.user, isPIN: true, isPINSet: true },
            profile: { ...profile.profile, isPIN: true, isPINSet: true },
          } as any);
        }
      } else {
        const errorMsg = response.message || strings.transactionPin.changeFailed;
        setChangePinError(errorMsg);
        Toast.show({
          type: 'error',
          text2: errorMsg,
        });
      }
    } catch (error: any) {
      devDebugger.log('❌ [Contractor Profile] Error changing PIN:', error);
      const errorMsg = error?.message || strings.transactionPin.changeFailed;
      setChangePinError(errorMsg);
      Toast.show({
        type: 'error',
        text2: errorMsg,
      });
    } finally {
      setIsChangingPin(false);
    }
  };

  useEffect(() => {
    setHasImageError(false);
  }, [
    profile?.user?.profileImageUrl,
    profile?.profile?.identityVerification?.profileImageUrl,
    profile?.profile?.identityVerification?.profileImage,
  ]);

  // Check real notification permission state on mount
  useEffect(() => {
    checkNotificationPermission().then((status) => {
      const isSystemGranted = status === RESULTS.GRANTED;
      const isAppSettingEnabled = Storage.getNotificationEnabled();
      setNotificationsEnabled(isSystemGranted && isAppSettingEnabled);
    });
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleOpenSupport = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Toast.showError(strings.common.noInternetConnection);
      return;
    }
    const name = profile?.user?.fullName || 'Contractor';
    const email = profile?.user?.email || 'contractor@example.com';
    await ZendeskService.openTicketHistory(name, email);
  };

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

  const getProfileImage = () => {
    if (hasImageError) {
      return require('@assets/images/contractor/profile/userProfile.png');
    }
    const profileImg = [
      profile?.user?.profileImageUrl,
      profile?.profile?.identityVerification?.profileImageUrl,
      profile?.profile?.identityVerification?.profileImage,
    ].find((url) => typeof url === 'string' && url.trim() !== '');

    if (profileImg) {
      return {
        uri: profileImg,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.web,
      };
    }
    return require('@assets/images/contractor/profile/userProfile.png');
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

  const displayName = profile?.user ? (profile.user.fullName || 'Contractor Name') : strings.mock.alexRoyal;
  const commissionText = strings.auth.contractor.profileDetails.commissionFee(
    settings?.transactionFeePercent != null ? `${settings.transactionFeePercent}%` : '7%'
  );

  return {
    profile,
    displayName,
    commissionText,
    profileImageSource: getProfileImage(),
    imageLoading,
    setImageLoading,
    hasImageError,
    setHasImageError,
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
    userEmail: profile?.user?.email || '',
    handlePinSettingPress,
    handleOpenSupport,
    navigateToProfileDetails: () => navigation.navigate('ProfileDetails'),
    navigateToCertifications: () => navigation.navigate('Certifications'),
    navigateToClockOutRequest: () => navigation.navigate('ClockOutRequest'),
    navigateToBankAccountDetails: () => navigation.navigate('BankAccountDetails'),
    navigateToRatings: () => navigation.navigate('Ratings'),
    navigateToForgetTransactionPin: () => navigation.navigate('ForgetTransactionPin'),
    navigateToResetTransactionPin: () => navigation.navigate('ForgetTransactionPin'),
    navigateToAboutUs: () => navigation.navigate('Information', { type: 'about' }),
    navigateToFaq: () => navigation.navigate('FAQ'),
    navigateToTerms: () => navigation.navigate('Information', { type: 'terms' }),
    navigateToPrivacy: () => navigation.navigate('Information', { type: 'privacy' }),
    rateApp,
  };
};
