import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    RefreshControl,
    Platform
} from 'react-native';
import { MenuView } from '@react-native-menu/menu';
import ContractorService from '@config/contractorService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import SkeletonFrame from '@components/SkeletonFrame';
import TopHeader from '@components/TopHeader';

import ConfirmationPopup from '@components/ConfirmationPopup';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'BankAccountDetails'>;

const BankSkeleton = () => (
    <View style={styles.bankCard}>
        <View style={styles.bankInfoContainer}>
            <SkeletonFrame width={horizontalScale(48)} height={horizontalScale(48)} borderRadius={horizontalScale(8)} />
            <View style={[styles.bankTexts, { marginLeft: horizontalScale(12) }]}>
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(20)} />
                <SkeletonFrame width={horizontalScale(150)} height={verticalScale(14)} style={{ marginTop: 4 }} />
            </View>
        </View>
        <SkeletonFrame width={24} height={24} borderRadius={12} />
    </View>
);

const BankAccountDetailsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Delete State
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBankInfo();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchBankInfo = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await ContractorService.getBankInfo();
            if (res.success && res.data) {
                const results = res.data;
                const data = Array.isArray(results) ? results : (Object.keys(results).length > 0 ? [results] : []);
                setBankAccounts(data);
            } else {
                setBankAccounts([]);
                setHasError(true);
            }
        } catch (err) {
            devDebugger.error('[Bank] Fetch Error:', err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBank = async () => {
        if (!selectedBank) return;

        setIsDeleting(true);
        try {
            const bankId = selectedBank._id || selectedBank.id;
            const res = await ContractorService.deleteBankInfo(bankId);

            if (res.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Bank account deleted successfully',
                });
                setIsDeleteModalVisible(false);
                fetchBankInfo();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: res.message || 'Failed to delete bank account',
                });
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.message || 'Something went wrong',
            });
        } finally {
            setIsDeleting(false);
            setSelectedBank(null);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View>
                    {[1, 2, 3].map((i) => (
                        <BankSkeleton key={i} />
                    ))}
                </View>
            );
        }

        if (hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 40 }}>
                    <EmptyState 
                        imageSource={require('@assets/images/common/noData.png')} 
                        title={strings.auth.contractor.profile.bankAccountList.noDataFoundTitle} 
                        description={strings.auth.contractor.profile.bankAccountList.noDataFoundDesc} 
                    />
                </View>
            );
        }

        if (bankAccounts.length === 0) {
            return renderEmptyState();
        }

        return (
            <>
                {bankAccounts.map((item, index) => (
                    <View
                        key={`${item._id || index}-${bankAccounts.length}`}
                        style={styles.bankCard}
                    >
                        <View style={styles.bankInfoContainer}>
                            <View style={styles.bankLogoContainer}>
                                <Image
                                    source={require('@assets/images/common/bankIcon.png')}
                                    style={styles.bankLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.bankTexts}>
                                <AppText style={styles.bankName} numberOfLines={1} ellipsizeMode="tail">{item.bankName || 'Bank Name'}</AppText>
                                <AppText style={styles.accountNumber}>{item.accountNumber ? `**** **** ${item.accountNumber.slice(-4)}` : '**** **** ****'}</AppText>
                            </View>
                        </View>

                        <MenuView
                            onPressAction={({ nativeEvent }) => {
                                if (nativeEvent.event === 'delete') {
                                    setSelectedBank(item);
                                    setIsDeleteModalVisible(true);
                                } else if (nativeEvent.event === 'update') {
                                    navigation.navigate('AddBankAccount', { item: item, isUpdate: true, isComingFrom: 'contractor' });
                                }
                            }}
                            actions={
                                [
                                    {
                                        id: 'update',
                                        title: strings.common.updateAccount,
                                        image: Platform.select({
                                            ios: 'pencil',
                                            android: 'ic_menu_edit',
                                        }),
                                    },
                                    {
                                        id: 'delete',
                                        title: strings.common.deleteAccount,
                                        attributes: {
                                            destructive: true,
                                        },
                                        image: Platform.select({
                                            ios: 'trash',
                                            android: 'ic_menu_delete',
                                        }),
                                    },
                                ]

                            }
                            shouldOpenOnLongPress={false}
                        >
                            <View style={styles.optionsBtn}>
                                <Image
                                    source={require('@assets/images/common/threeDot.png')}
                                    style={styles.optionsIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </MenuView>
                    </View>
                ))}



                <ConfirmationPopup
                    visible={isDeleteModalVisible}
                    onClose={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedBank(null);
                    }}
                    onConfirm={handleDeleteBank}
                    message="Are you sure you want to delete this bank account?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    isLoading={isDeleting}
                    isDestructive
                />
            </>
        );
    };

    const renderEmptyState = () => {
        const content = strings.auth.client.payment;
        return (
            <View style={styles.emptyStateContainer}>
                <EmptyState 
                    imageSource={require('@assets/images/common/bank.png')} 
                    title={content.emptyBankTitle} 
                    description={content.emptyBankDescription} 
                />
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            <TopHeader title={strings.auth.contractor.profile.bankAccountList.screenTitle} onBack={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && bankAccounts.length > 0}
                        onRefresh={fetchBankInfo}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <TouchableOpacity
                    style={styles.addAccountRow}
                    onPress={() => navigation.navigate('AddBankAccount', { isComingFrom: 'contractor' })}
                    activeOpacity={0.7}
                >
                    <AppText style={styles.addAccountText}>{strings.auth.contractor.profile.bankAccountList.addNewAccount}</AppText>
                    <View style={styles.plusIconContainer}>
                        <Image
                            source={require('@assets/images/common/add.png')}
                            style={styles.plusIcon}
                        />
                    </View>
                </TouchableOpacity>

                <AppText style={styles.sectionTitle}>{strings.auth.contractor.profile.bankAccountList.savedBankAccount}</AppText>

                {renderContent()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(30),
    },
    addAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(56),
        marginBottom: verticalScale(32),
    },
    addAccountText: {
        fontSize: fontSize(14),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    plusIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIcon: {
        width: 20,
        height: 20,
    },
    sectionTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(16),
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: verticalScale(16),
    },
    bankInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bankLogoContainer: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(8),
        backgroundColor: colors.bcaBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(12),
    },
    bankLogo: {
        width: horizontalScale(40),
        height: horizontalScale(30),
        tintColor: colors.white,
    },
    bankTexts: {
        flex: 1,
        gap: 4,
    },
    bankName: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
        marginRight: horizontalScale(20),
    },
    accountNumber: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    optionsBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: horizontalScale(15),
    },
    optionsIcon: {
        width: 20,
        height: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: verticalScale(40),
    },
    emptyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(80),
    },
    emptyContentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: verticalScale(100),
    },
    illustration: {
        width: horizontalScale(200),
        height: horizontalScale(160),
        resizeMode: 'contain',
        marginBottom: verticalScale(30),
    },
    emptyTitle: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginBottom: verticalScale(12),
    },
    emptyDescription: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: verticalScale(20),
        paddingHorizontal: horizontalScale(20),
    },
});

export default BankAccountDetailsScreen;
