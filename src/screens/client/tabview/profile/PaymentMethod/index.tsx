import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import SkeletonFrame from '@components/SkeletonFrame';
import PaymentService from '@config/paymentService';
import styles from './styles';
import strings from '@constants/strings';
import colors from '@styles/colors';
import { horizontalScale, verticalScale } from '@styles/mixins';
import ConfirmationPopup from '@components/ConfirmationPopup';
import { Toast } from '@utils/ToastManager';
import { MenuView } from '@react-native-menu/menu';
import { Platform } from 'react-native';
import AppText from '@components/AppText';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import { duration } from 'moment';
import { devDebugger } from '@utils/devDebugger';
import AuthService from '@config/authService';
import PinInput from '@components/PinInput';
import { encryptPin } from '@utils/cryptoUtils';

const PaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const activeTab = 'Bank Account';

  const [banks, setBanks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { setClientProfile } = useUserStore();
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [setPinError, setSetPinError] = useState<string | undefined>(undefined);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<any>(null);

  const fetchPaymentMethods = useCallback(async (pageNum: number, refreshing: boolean = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      else if (pageNum === 1) setIsLoading(true);

      const response = await PaymentService.getPaymentMethods(pageNum);

      if (response.success) {
        const results = response.data?.results || response.data || [];
        const newCards = results.filter((item: any) => item.type === 'credit_card');
        const newBanks = results.filter((item: any) => item.type === 'bank_account');

        if (refreshing || pageNum === 1) {
          setBanks(newBanks);
        } else {
          setBanks(prev => [...prev, ...newBanks]);
        }

        // Handle hasMore based on your API's pagination metadata
        if (results.length < 10) setHasMore(false);
        else setHasMore(true);
      }
    } catch (error) {
      devDebugger.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setPage(1);
      fetchPaymentMethods(1);
      AuthService.getClientProfile()
        .then((res: any) => {
          const data = res?.data || res?.results;
          if (res?.success && data) {
            setClientProfile(data);
          }
        })
        .catch(() => {});
    });
    return unsubscribe;
  }, [navigation, fetchPaymentMethods, setClientProfile]);

  const handleRefresh = () => {
    setPage(1);
    fetchPaymentMethods(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPaymentMethods(nextPage);
    }
  };

  const handleBack = () => navigation.goBack();
  const handleAddNew = () => {
    if (useUserStore.getState().isClientRestricted()) {
      Toast.show({
        type: 'info',
        text2: strings.client.home.accountVerificationInProgress,
        duration: 4500
      });
      return;
    }
    navigation.navigate('AddBankAccount', {
      isComingFrom: 'client'
    });
  };

  const handleMethodPress = useCallback((item: any) => {
    if (checkIsPinSet()) {
      navigation.navigate('AddMoney', { paymentMethod: item });
    } else {
      setPendingPaymentMethod(item);
      setSetPinError(undefined);
      setShowSetPinModal(true);
    }
  }, [navigation]);

  const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
    setIsSettingPin(true);
    setSetPinError(undefined);
    try {
      const encPin = encryptedPin || encryptPin(pin).encryptedPin;
      devDebugger.log('🔐 [Payment Method] Setting transaction PIN:', { pin, encryptedPin: encPin });
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

        const current = useUserStore.getState().clientProfile;
        if (current) {
          setClientProfile({
            ...current,
            isPIN: true,
            isPINSet: true,
            user: { ...current.user, isPIN: true, isPINSet: true },
            profile: { ...current.profile, isPIN: true, isPINSet: true },
          } as any);
        }

        const targetItem = pendingPaymentMethod;
        setPendingPaymentMethod(null);
        if (targetItem) {
          navigation.navigate('AddMoney', { paymentMethod: targetItem });
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
      devDebugger.log('❌ [Payment Method] Error setting PIN:', error);
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

  const handleMorePress = useCallback((item: any) => {
    setSelectedItem(item);
    setShowDeletePopup(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      const id = selectedItem._id || selectedItem.id || selectedItem.paymentMethodId;
      if (!id) throw new Error('Payment method ID not found');

      const response = await PaymentService.deletePaymentMethod(id);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Payment method deleted successfully' });
        handleRefresh();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response.message || 'Failed to delete payment method' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'An error occurred' });
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
      setSelectedItem(null);
    }
  };

  const renderShimmer = () => (
    <View style={{ marginTop: verticalScale(10) }}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.savedItemCard, { marginBottom: verticalScale(16), borderStyle: 'dashed' }]}>
          <SkeletonFrame width={horizontalScale(40)} height={horizontalScale(40)} borderRadius={8} />
          <View style={[styles.itemMain, { marginLeft: horizontalScale(12) }]}>
            <SkeletonFrame width="60%" height={verticalScale(16)} style={{ marginBottom: verticalScale(8) }} />
            <SkeletonFrame width="40%" height={verticalScale(12)} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <View style={styles.savedItemCard}>
        <TouchableOpacity
          style={styles.itemMainRow}
          onPress={() => handleMethodPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('@assets/images/common/bankIcon.png')}
              style={styles.itemIcon}
            />
          </View>
          <View style={styles.itemMain}>
            <AppText style={styles.itemName}>{item.bankName || item.cardBrand || ('BCA')}</AppText>
            <AppText style={styles.itemSub}>{`**** **** **${(item.lastFourDigits || '8907').slice(0, 2)} ${(item.lastFourDigits || '8907').slice(2)}`}</AppText>
          </View>
        </TouchableOpacity>

        <MenuView
          key={`menu-${item._id || item.id || item.paymentMethodId}-${banks.length}`}
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;
            if (actionId === 'delete') {
              handleMorePress(item);
            } else if (actionId === 'update') {
              navigation.navigate('AddBankAccount', {
                item,
                isUpdate: true,
                isComingFrom: 'client'
              });
            }
          }}
          actions={[
            {
              id: 'update',
              title: 'Update',
              image: Platform.select({
                ios: 'pencil',
                android: 'ic_menu_edit',
              }),
            },
            {
              id: 'delete',
              title: 'Delete',
              attributes: {
                destructive: true,
              },
              image: Platform.select({
                ios: 'trash',
                android: 'ic_menu_delete',
              }),
            },
          ]}
          shouldOpenOnLongPress={false}
        >
          <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Image source={require('@assets/images/common/threeDot.png')} style={styles.moreIcon} />
          </View>
        </MenuView>
      </View>
    );
  }, [activeTab, handleMethodPress, handleMorePress, navigation, banks]);

  const renderEmptyState = () => {
    const content = strings.auth.client.payment;
    return (
      <View style={styles.emptyStateContainer}>
        <Image
          source={require('@assets/images/common/bank.png')}
          style={styles.illustration}
        />
        <AppText style={styles.emptyTitle}>
          {content.emptyBankTitle}
        </AppText>
        <AppText style={styles.emptyDescription}>
          {content.emptyBankDescription}
        </AppText>
      </View>
    );
  };

  const currentData = banks;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <TopHeader title="Payment Method" onBack={handleBack} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.addMethodRow} activeOpacity={0.7} onPress={handleAddNew}>
          <AppText style={styles.addMethodText}>
            {strings.client.profile.cardDetails.addNewBankAccount}
          </AppText>
          <Image source={require('@assets/images/common/add.png')} style={styles.plusIcon} />
        </TouchableOpacity>

        {isLoading && page === 1 ? (
          renderShimmer()
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => (item._id || item.id || item.paymentMethodId || index).toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: verticalScale(16) }} />}
            ListHeaderComponent={() => (
              currentData.length > 0 ? (
                <AppText style={styles.sectionLabel}>
                  {strings.client.profile.cardDetails.savedBankAccount}
                </AppText>
              ) : null
            )}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              isLoading && page > 1 ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : <View style={{ height: 100 }} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ConfirmationPopup
        visible={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteConfirm}
        message={strings.client.profile.cardDetails.deleteConfirmMessage(activeTab.toLowerCase())}
        confirmText={strings.client.profile.cardDetails.deleteBtn}
        cancelText={strings.client.profile.cardDetails.cancelBtn}
        isLoading={isDeleting}
        isDestructive={true}
      />

      {/* Transaction PIN Setup Modal */}
      <PinInput
        visible={showSetPinModal}
        mode="setup"
        error={setPinError}
        onClose={() => {
          setShowSetPinModal(false);
          setSetPinError(undefined);
          setPendingPaymentMethod(null);
        }}
        loading={isSettingPin}
        onComplete={(pin, encryptedPin) => handleSetPinComplete(pin, encryptedPin)}
      />
    </View>
  );
};

export default PaymentMethodScreen;
