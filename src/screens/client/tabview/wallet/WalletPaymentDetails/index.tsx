import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import TopHeader from '@components/TopHeader';
import Fonts from '@assets/Fonts';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import PaymentService from '@config/paymentService';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles, formatTransactionType } from '@utils/statusUtils';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import styles from './styles';
import AppText from '@components/AppText';
import SkeletonFrame from '@components/SkeletonFrame';
import EmptyState from '@components/EmptyState';
import CopyableTransactionId from '@components/CopyableTransactionId';
import { devDebugger } from '@utils/devDebugger';

const WalletPaymentDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { transactionId, invoiceData: initialData } = route.params || {};
    const walletStrings = strings.client.wallet;

    const [loading, setLoading] = useState(!!transactionId);
    const [hasError, setHasError] = useState(false);
    const [transactionData, setTransactionData] = useState<any>(initialData || null);

    useEffect(() => {
        if (transactionId) {
            fetchTransactionDetails();
        }
    }, [transactionId]);

    const fetchTransactionDetails = async () => {
        try {
            setLoading(true);
            setHasError(false);
            const response = await PaymentService.getWalletTransactionDetails(transactionId);
            if (response.success) {
                const resAny = response as any;
                const data = resAny.data?.results || resAny.data?.data || resAny.data || resAny.results || resAny;
                setTransactionData(data);
            } else {
                setHasError(true);
                setTransactionData(null);
                Toast.show({ type: 'error', text2: response.message || walletStrings.failedToLoadDetails });
            }
        } catch (error: any) {
            devDebugger.error('Error fetching transaction details:', error);
            setHasError(true);
            setTransactionData(null);
            Toast.show({ type: 'error', text2: error.message || walletStrings.anErrorOccurred });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={walletStrings.transactionDetailsTitle} onBack={() => navigation.goBack()} />
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.summaryCard}>
                        <View style={styles.avatarContainer}>
                            <SkeletonFrame width={horizontalScale(64)} height={horizontalScale(64)} borderRadius={horizontalScale(32)} />
                        </View>
                        <SkeletonFrame width={horizontalScale(140)} height={verticalScale(22)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(12) }} />
                        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(28)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(16) }} />
                        <SkeletonFrame width={horizontalScale(80)} height={verticalScale(24)} borderRadius={horizontalScale(12)} />
                    </View>

                    <SkeletonFrame width={horizontalScale(130)} height={verticalScale(20)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(12), marginLeft: horizontalScale(4) }} />
                    
                    <View style={styles.detailsCard}>
                        {[1, 2, 3, 4, 5].map((item, index) => (
                            <View key={index} style={[styles.detailRow, index === 4 && { borderBottomWidth: 0 }]}>
                                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={horizontalScale(4)} />
                                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} borderRadius={horizontalScale(4)} />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    }

    if (hasError || !transactionData || Object.keys(transactionData).length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={walletStrings.transactionDetailsTitle} onBack={() => navigation.goBack()} />
                <View style={[styles.centered]}>
                    <EmptyState
                        title={walletStrings.noDetailsFound}
                        description={walletStrings.noDetailsDesc}
                        imageSource={require('@assets/images/common/noData.png')}
                    />
                </View>
            </View>
        );
    }

    const statusStyle = getStatusStyles(transactionData.paymentStatus || transactionData.status || 'Pending');
    const isCredit = transactionData.type === 'credit';
    const txType = transactionData.transactionType || transactionData.source;
    const isAddMoney = ['add_money_eft', 'add_money', 'ADD_MONEY_EFT'].includes(txType);
    
    const amountValue = isAddMoney 
        ? (transactionData.amount || 0) 
        : (transactionData.totalPayableAmount || transactionData.costBreakdown?.totalCost || transactionData.amount || 0);
        
    const amountText = `${formatCurrency(amountValue)}`;
    
    const formattedDate = transactionData.dateOfPayment || transactionData.createdAt || transactionData.dateTime;
    const { date: displayDate, time: displayTime } = getLocalDateTime(formattedDate);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={walletStrings.transactionDetailsTitle} onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.placeholderAvatar, { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' }]}>
                            {isCredit ? (
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            ) : (
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke={colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                        </View>
                    </View>

                    <View style={styles.amountContainer}>
                        <AppText style={[styles.amountText, { color: isCredit ? colors.green : colors.textDark, fontSize: fontSize(28) }]}>
                            {amountText}
                        </AppText>
                    </View>

                    {transactionData.name ? (
                        <AppText style={[styles.nameText, { marginBottom: 0 }]}>
                            {transactionData.name}
                        </AppText>
                    ) : null}
                </View>

                <AppText style={styles.sectionTitle}>{walletStrings.transactionInformation}</AppText>
                <View style={styles.detailsCard}>
                    {transactionData.transactionId && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                <View style={styles.detailIconWrapper}>
                                    <Image source={require('@assets/images/common/resume.png')} style={styles.detailIcon} />
                                </View>
                                <AppText style={styles.detailLabel}>{walletStrings.transactionId}</AppText>
                            </View>
                            <CopyableTransactionId 
                                transactionId={transactionData.transactionId}
                                style={{ flex: 1.5, justifyContent: 'flex-end', marginLeft: horizontalScale(30) }}
                                textStyle={[styles.detailValue, { textAlign: 'right' }]}
                            />
                        </View>
                    )}

                    {txType && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                <View style={styles.detailIconWrapper}>
                                    <Image source={require('@assets/images/common/payment.png')} style={styles.detailIcon} />
                                </View>
                                <AppText style={styles.detailLabel}>{walletStrings.transactionTypeLabel}</AppText>
                            </View>
                            <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]}>
                                {formatTransactionType(txType)}
                            </AppText>
                        </View>
                    )}

                    {transactionData.type && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                <View style={styles.detailIconWrapper}>
                                    <Image source={require('@assets/images/common/payment.png')} style={styles.detailIcon} />
                                </View>
                                <AppText style={styles.detailLabel}>{walletStrings.typeLabel}</AppText>
                            </View>
                            <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right', textTransform: 'capitalize' }]}>
                                {transactionData.type}
                            </AppText>
                        </View>
                    )}

                    {transactionData.jobDetails?.reference && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                <View style={styles.detailIconWrapper}>
                                    <Image source={require('@assets/images/common/resume.png')} style={styles.detailIcon} />
                                </View>
                                <AppText style={styles.detailLabel}>{walletStrings.jobReferenceLabel}</AppText>
                            </View>
                            <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]}>
                                {transactionData.jobDetails.reference}
                            </AppText>
                        </View>
                    )}

                    {transactionData.jobDetails?.title && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                <View style={styles.detailIconWrapper}>
                                    <Image source={require('@assets/images/common/resume.png')} style={styles.detailIcon} />
                                </View>
                                <AppText style={styles.detailLabel}>{walletStrings.jobTitleLabel}</AppText>
                            </View>
                            <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]} numberOfLines={2}>
                                {transactionData.jobDetails.title}
                            </AppText>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIconContainer, { flex: 1 }]}>
                            <View style={styles.detailIconWrapper}>
                                <Image source={require('@assets/images/common/calander.png')} style={{ width: horizontalScale(14), height: horizontalScale(14), tintColor: colors.primary, resizeMode: 'contain' }} />
                            </View>
                            <AppText style={styles.detailLabel}>{walletStrings.dateLabel} & {walletStrings.timeLabel}</AppText>
                        </View>
                        <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]}>{`${displayDate}, ${displayTime}`}</AppText>
                    </View>
                    
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                        <View style={[styles.detailIconContainer, { flex: 1 }]}>
                            <View style={styles.detailIconWrapper}>
                                <Image source={require('@assets/images/common/check.png')} style={{ width: horizontalScale(14), height: horizontalScale(14), tintColor: colors.primary, resizeMode: 'contain' }} />
                            </View>
                            <AppText style={styles.detailLabel}>{walletStrings.statusLabel}</AppText>
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                            <View style={[styles.statusBadge, statusStyle.badge]}>
                                <AppText style={[styles.statusText, statusStyle.text]}>
                                    {statusStyle.label}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>

                {transactionData.bankDetails && (
                    <View style={{ marginTop: verticalScale(24) }}>
                        <AppText style={styles.sectionTitle}>{walletStrings.bankDetailsTitle}</AppText>
                        <View style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                    <View style={styles.detailIconWrapper}>
                                        <Image source={require('@assets/images/common/bankDetails.png')} style={{ width: horizontalScale(20), height: horizontalScale(20), resizeMode: 'contain' }} />
                                    </View>
                                    <AppText style={styles.detailLabel}>{walletStrings.bankNameLabel}</AppText>
                                </View>
                                <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]} numberOfLines={2}>
                                    {transactionData.bankDetails.bankName}
                                </AppText>
                            </View>
                            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                <View style={[styles.detailIconContainer, { flex: 1 }]}>
                                    <View style={styles.detailIconWrapper}>
                                        <Image source={require('@assets/images/common/userGray.png')} style={{ width: horizontalScale(18), height: horizontalScale(18), tintColor: colors.primary, resizeMode: 'contain' }} />
                                    </View>
                                    <AppText style={styles.detailLabel}>{walletStrings.holderNameLabel}</AppText>
                                </View>
                                <AppText style={[styles.detailValue, { flex: 1.5, textAlign: 'right' }]}>
                                    {transactionData.bankDetails.holderName}
                                </AppText>
                            </View>
                        </View>
                    </View>
                )}

                {!isAddMoney && transactionData.costBreakdown && (
                    <View style={{ marginTop: verticalScale(24) }}>
                        <AppText style={styles.sectionTitle}>{walletStrings.costBreakdownTitle}</AppText>
                        <View style={styles.detailsCard}>
                            <View style={styles.detailRow}>
                                <AppText style={styles.detailLabel}>{walletStrings.jobCostLabel}</AppText>
                                <AppText style={[styles.detailValue, { textAlign: 'right' }]}>
                                    {formatCurrency(transactionData.costBreakdown.netPayable || transactionData.totalPayableAmount || 0)}
                                </AppText>
                            </View>

                            {Number(transactionData.costBreakdown.transactionFee || transactionData.transactionFee || 0) > 0 && (
                                <View style={styles.detailRow}>
                                    <AppText style={styles.detailLabel}>{walletStrings.transactionFee}</AppText>
                                    <AppText style={[styles.detailValue, { textAlign: 'right' }]}>
                                        {formatCurrency(transactionData.costBreakdown.transactionFee || transactionData.transactionFee || 0)}
                                    </AppText>
                                </View>
                            )}

                            {Number(transactionData.costBreakdown.bookingFee || transactionData.bookingFee || 0) > 0 && (
                                <View style={styles.detailRow}>
                                    <AppText style={styles.detailLabel}>{walletStrings.bookingFeeLabel}</AppText>
                                    <AppText style={[styles.detailValue, { textAlign: 'right' }]}>
                                        {formatCurrency(transactionData.costBreakdown.bookingFee || transactionData.bookingFee || 0)}
                                    </AppText>
                                </View>
                            )}

                            {Number(transactionData.costBreakdown.penaltyDeduction || transactionData.penaltyDeduction || 0) > 0 && (
                                <View style={styles.detailRow}>
                                    <AppText style={styles.detailLabel}>{walletStrings.penaltyDeduction}</AppText>
                                    <AppText style={[styles.detailValue, { textAlign: 'right', color: colors.black}]}>
                                        {formatCurrency(transactionData.costBreakdown.penaltyDeduction || transactionData.penaltyDeduction || 0)}
                                    </AppText>
                                </View>
                            )}

 {Number(transactionData.costBreakdown.disputeFee || 0) > 0 && (
                                <View style={styles.detailRow}>
                                    <AppText style={styles.detailLabel}>{walletStrings.disputeFee}</AppText>
                                    <AppText style={[styles.detailValue, { textAlign: 'right', color: colors.black }]}>
                                        {formatCurrency(transactionData.costBreakdown.disputeFee || transactionData.penaltyDeduction || 0)}
                                    </AppText>
                                </View>
                            )}
                            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                <AppText style={[styles.detailLabel, { color: colors.textDark, fontFamily: Fonts.bold }]}>
                                    {transactionData.transactionType?.toLowerCase().includes('refund') 
                                        ? walletStrings.refundAmount 
                                        : walletStrings.totalPayableLabel}
                                </AppText>
                                <AppText style={[styles.detailValue, { textAlign: 'right', color: colors.primary, fontFamily: Fonts.bold }]}>
                                    {formatCurrency(transactionData.costBreakdown.totalCost || transactionData.jobCost )}
                                </AppText>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default WalletPaymentDetailsScreen;
