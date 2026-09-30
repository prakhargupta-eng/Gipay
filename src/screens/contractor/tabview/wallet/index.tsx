// src/screens/contractor/tabview/wallet/index.tsx

import React, { useState } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, TouchableOpacity, Image, StatusBar, ScrollView, ImageBackground, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import AppText from '@components/AppText';
import PaymentService from '@config/paymentService';
import SkeletonFrame from '@components/SkeletonFrame';
import { verticalScale } from '@styles/mixins';
import { devDebugger } from '@utils/devDebugger';
import { useUserStore, checkIsPinSet } from '@store/useUserStore';
import PinInput from '@components/PinInput';
import ContractorService from '@config/contractorService';
import { encryptPin } from '@utils/cryptoUtils';
import { Toast } from '@utils/ToastManager';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'ContractorTabs'>;

const Wallet = () => {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const walletStrings = strings.auth.contractor.wallet;
    const { profile, setProfile } = useUserStore();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [showSetPinModal, setShowSetPinModal] = useState(false);
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [setPinError, setSetPinError] = useState<string | undefined>(undefined);

    const fetchDashboard = async () => {
        try {
            const response = await PaymentService.getContractorWalletDashboard();
            if (response.success && response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            devDebugger.error('Failed to fetch contractor wallet dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDashboard();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboard();
    };

    const handleWithdrawPress = () => {
        if (checkIsPinSet()) {
            navigation.navigate('WithdrawAmount', { availableBalance: dashboardData?.availableBalance || 0 });
        } else {
            setSetPinError(undefined);
            setShowSetPinModal(true);
        }
    };

    const handleSetPinComplete = async (pin: string, encryptedPin?: string) => {
        setIsSettingPin(true);
        setSetPinError(undefined);
        try {
            const encPin = encryptedPin || encryptPin(pin).encryptedPin;
            devDebugger.log('🔐 [Contractor Wallet] Setting transaction PIN:', { pin, encryptedPin: encPin });
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

                const current = useUserStore.getState().profile || profile;
                if (current) {
                    setProfile({
                        ...current,
                        isPIN: true,
                        isPINSet: true,
                        keyset: true,
                        user: { ...current.user, isPIN: true, isPINSet: true },
                        profile: { ...current.profile, isPIN: true, isPINSet: true },
                    } as any);
                }

                navigation.navigate('WithdrawAmount', { availableBalance: dashboardData?.availableBalance || 0 });
            } else {
                const errorMsg = response.message || strings.transactionPin.setFailed;
                setSetPinError(errorMsg);
                Toast.show({
                    type: 'error',
                    text2: errorMsg,
                });
            }
        } catch (error: any) {
            devDebugger.log('❌ [Contractor Wallet] Error setting PIN:', error);
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

    const menuItems = [
        {
            id: 'view',
            title: walletStrings.viewEarning,
            subTitle: walletStrings.viewEarningSub,
            icon: require('@assets/images/client/wallets/view.png'),
            bgColor: '#F0EDFF',
            iconColor: '#1B00A6',
            onPress: () => navigation.navigate('ViewEarning' as any)
        },
        {
            id: 'withdraw',
            title: walletStrings.withdrawAmount,
            subTitle: walletStrings.withdrawAmountSub,
            icon: require('@assets/images/client/wallets/withdraw.png'),
            bgColor: '#E1F9E2',
            iconColor: '#10C71A',
            onPress: handleWithdrawPress
        },
        {
            id: 'history',
            title: walletStrings.viewTransactionHistory,
            subTitle: walletStrings.viewTransactionHistorySub,
            icon: require('@assets/images/client/wallets/history.png'),
            bgColor: '#E1F1FF',
            iconColor: '#005FB2',
            onPress: () => navigation.navigate('TransactionHistory' as any)
        }
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView 
                style={{ flex: 1 }} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            >
                {/* Purple Header */}
                <ImageBackground 
                    source={require('@assets/images/contractor/homeTopBg.png')}
                    style={[styles.header, { paddingTop: insets.top + 10 }]}
                    resizeMode="cover"
                >
                    <View style={styles.headerTop}>
                        <AppText style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{walletStrings.screenTitle}</AppText>
                       
                    </View>
                    {/* Total Earnings Card */}
                    <View style={styles.mainCard}>
                        <AppText style={styles.cardLabel} numberOfLines={1} ellipsizeMode="tail">{walletStrings.totalEarnings}</AppText>
                        {loading && !refreshing ? (
                            <SkeletonFrame width={160} height={verticalScale(80)} borderRadius={8} />
                        ) : (
                            <AppText style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit  ellipsizeMode="tail">
                                {formatCurrency(dashboardData?.totalEarnings || 0)}
                            </AppText>
                        )}
                    </View>

                    {/* Balance Row */}
                    <View style={styles.balanceRow}>
                        <View style={styles.subCard}>
                            <AppText style={[styles.subCardLabel, { color: colors.walletPending }]} numberOfLines={1} ellipsizeMode="tail">
                                {walletStrings.noPenalty}
                            </AppText>
                            {loading && !refreshing ? (
                                <SkeletonFrame width={90} height={verticalScale(50)} borderRadius={6} />
                            ) : (
                                <AppText style={styles.subCardValue} numberOfLines={1} adjustsFontSizeToFit  ellipsizeMode="tail">
                                    {formatCurrency(dashboardData?.outstandingPenaltyAmount || 0)}
                                </AppText>
                            )}
                        </View>
                        <View style={styles.subCard}>
                            <AppText style={[styles.subCardLabel, { color: colors.walletAvailable }]} numberOfLines={1} ellipsizeMode="tail">
                                {walletStrings.availableBalance}
                            </AppText>
                            {loading && !refreshing ? (
                                <SkeletonFrame width={90} height={verticalScale(50)} borderRadius={6} />
                            ) : (
                                    <AppText style={styles.subCardValue} numberOfLines={1} adjustsFontSizeToFit  ellipsizeMode="tail">
                                        {formatCurrency(dashboardData?.availableBalance || 0)}
                                    </AppText>
                            )}
                        </View>
                    </View>
                </ImageBackground>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem} 
                            activeOpacity={0.8}
                            onPress={item.onPress}
                        >
                            <View style={[styles.menuIconWrapper, { backgroundColor: item.bgColor }]}>
                                <Image 
                                    source={item.icon} 
                                    style={[styles.menuIcon, { tintColor: item.iconColor }]} 
                                />
                            </View>
                            <View style={styles.menuContent}>
                                <AppText style={styles.menuTitle}>{item.title}</AppText>
                                <AppText style={styles.menuSubTitle}>{item.subTitle}</AppText>
                            </View>
                            <Image 
                                source={require('@assets/images/common/backIcon.png')} 
                                style={styles.arrowIcon} 
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Transaction PIN Setup Modal */}
            <PinInput
                visible={showSetPinModal}
                mode="setup"
                onClose={() => {
                    setShowSetPinModal(false);
                    setSetPinError(undefined);
                }}
                loading={isSettingPin}
                error={setPinError}
                onComplete={(pin, encryptedPin) => handleSetPinComplete(pin, encryptedPin)}
            />
        </View>
    );
};

export default Wallet;
