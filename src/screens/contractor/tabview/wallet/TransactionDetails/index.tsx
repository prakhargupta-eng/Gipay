import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import TopHeader from '@components/TopHeader';
import colors from '@styles/colors';
import { horizontalScale, verticalScale } from '@styles/mixins';
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

const ContractorTransactionDetails = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { txnId } = route.params || {};
    const walletStrings = strings.auth.contractor.wallet;

    const [loading, setLoading] = useState(!!txnId);
    const [hasError, setHasError] = useState(false);
    const [transactionData, setTransactionData] = useState<any>(null);

    useEffect(() => {
        if (txnId) {
            fetchDetails();
        }
    }, [txnId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setHasError(false);
            const response = await PaymentService.getContractorTransactionDetails(txnId);
            if (response.success) {
                const resAny = response as any;
                const data = resAny.data?.results || resAny.data?.data || resAny.data || resAny.results || resAny;
                setTransactionData(data);
            } else {
                setHasError(true);
                Toast.show({ type: 'error', text2: response.message || walletStrings.failedToLoadDetails });
            }
        } catch (error: any) {
            devDebugger.error('Error fetching contractor transaction details:', error);
            setHasError(true);
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
                    <View style={{ marginBottom: verticalScale(24) }}>
                        <SkeletonFrame width={horizontalScale(150)} height={verticalScale(24)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(8) }} />
                        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={horizontalScale(4)} />
                    </View>
                    <SkeletonFrame width={horizontalScale(80)} height={verticalScale(20)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(12) }} />
                    <View style={styles.skeletonRowContainer}>
                        <SkeletonFrame width={horizontalScale(44)} height={horizontalScale(44)} borderRadius={horizontalScale(22)} />
                        <View style={styles.skeletonMarginLeft}>
                            <SkeletonFrame width={horizontalScale(120)} height={verticalScale(20)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(6) }} />
                            <SkeletonFrame width={horizontalScale(90)} height={verticalScale(16)} borderRadius={horizontalScale(4)} />
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(24)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(12) }} />
                    <SkeletonFrame width={'100%'} height={verticalScale(120)} borderRadius={horizontalScale(12)} style={{ marginBottom: verticalScale(24) }} />
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(24)} borderRadius={horizontalScale(4)} style={{ marginBottom: verticalScale(12) }} />
                    <SkeletonFrame width={'100%'} height={verticalScale(120)} borderRadius={horizontalScale(12)} />
                </ScrollView>
            </View>
        );
    }

    if (hasError || !transactionData || Object.keys(transactionData).length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <TopHeader title={walletStrings.transactionDetailsTitle} onBack={() => navigation.goBack()} />
                <View style={styles.centered}>
                    <EmptyState
                        title={walletStrings.noTransactionsTitle}
                        description={walletStrings.noTransactionDetailsDesc}
                        imageSource={require('@assets/images/common/noData.png')}
                    />
                </View>
            </View>
        );
    }

    const {
        transactionId: apiTxnId,
        invoiceNumber,
        paymentStatus,
        jobDetails,
        clientDetails,
        contractorDetails,
        costBreakdown,
        totalPayableAmount,
        transactionType,
        type
    } = transactionData;

    const statusStyle = getStatusStyles(paymentStatus || 'Pending');

    // Safely parse dates
    let displayDate = '-';
    let displayTime = '-';
    if (jobDetails?.startDate) {
        displayDate = `${getLocalDateTime(jobDetails.startDate).date} - ${getLocalDateTime(jobDetails.endDate || jobDetails.startDate).date}`;
        displayTime = `${jobDetails.startTime || '-'} - ${jobDetails.endTime || '-'}`;
    }

    const isNoShow = transactionData?.transactionType === 'noShowPenalty';
    const isWithdrawal = transactionData?.transactionType === 'withdrawal' || transactionData?.transactionType === 'eftWithdrawal';

    const activeDetails = isNoShow ? contractorDetails : clientDetails;
    
    let displayAvatar = require('@assets/images/common/dummyUser.png');
    if (isWithdrawal) {
        displayAvatar = require('@assets/images/common/dummyUser.png');
    } else if (activeDetails?.profileImage) {
        displayAvatar = { uri: activeDetails.profileImage };
    } else if (transactionData?.profileImage) {
        displayAvatar = { uri: transactionData.profileImage };
    }

    let displayName = '';
    if (activeDetails?.name) {
        displayName = activeDetails.name;
    } else if (transactionData?.name) {
        displayName = transactionData.name;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={walletStrings.transactionDetailsTitle} onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Invoice Header */}
                <View style={styles.headerRow}>
                    <View style={styles.invoiceHeaderLeft}>
                        <AppText style={styles.invoiceLabel}>{walletStrings.invoiceNumberTitle || 'Invoice Number'}</AppText>
                        <CopyableTransactionId
                            transactionId={invoiceNumber || `#${apiTxnId?.substring(0, 8) || txnId?.substring(0, 8)}`}
                            textStyle={styles.invoiceValue}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        />
                    </View>
                    <View style={styles.invoiceHeaderRight}>
                        {jobDetails?.reference && (
                            <AppText style={styles.jobRefLabel} numberOfLines={1} ellipsizeMode="tail">
                                {walletStrings.jobRefTitle || 'Job Ref'}: {jobDetails.reference}
                            </AppText>
                        )}
                        <View style={[styles.statusBadge, statusStyle.badge]}>
                            <AppText style={[styles.statusText, statusStyle.text]}>
                                {statusStyle.label}
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* Paid By / Self Section */}
                <AppText style={styles.sectionTitle}>
                    {isWithdrawal ? (walletStrings.self || 'Self') : (walletStrings.paidByTitle || 'Paid By')}
                </AppText>
                <View style={styles.paidToCard}>
                    <Image
                        source={isWithdrawal ? require('@assets/images/common/bca.png') : displayAvatar}
                        style={styles.avatar}
                    />
                    <View style={styles.paidToNameWidth}>
                        <AppText style={styles.paidToName} numberOfLines={isWithdrawal ? 2 : 1} ellipsizeMode="tail">
                            {displayName}
                        </AppText>

                        {!isWithdrawal && contractorDetails?.hourlyRate && (
                            <AppText style={styles.paidToRate}>{walletStrings.hourlyRateTitle}: {formatCurrency(contractorDetails.hourlyRate)}/h</AppText>
                        )}
                    </View>
                </View>
                <View style={styles.divider} />


                {/* Job Details Section */}
                {jobDetails && (
                    <View style={styles.jobDetailsCard}>
                        <View style={styles.jobTitleRow}>
                            <AppText style={styles.jobTitle}>{jobDetails.title}</AppText>
                        </View>

                        <View style={styles.jobRateRow}>
                            <Image source={require('@assets/images/common/doller.png')} style={styles.iconSmall} />
                            <AppText style={styles.jobRateText}>{walletStrings.jobRateTitle}: {formatCurrency(jobDetails.jobRate || 0)}/h</AppText>
                        </View>

                        <View style={styles.dateTimeRow}>
                            <View style={styles.dateItem}>
                                <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
                                <AppText style={styles.dateText}>{displayDate}</AppText>
                            </View>
                            <View style={styles.dateItem}>
                                <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
                                <AppText style={styles.dateText}>{displayTime}</AppText>
                            </View>
                        </View>

                        {transactionType && (
                            <View style={styles.transactionTypeDetailRow}>
                                <AppText style={styles.transactionTypeLabel}>{walletStrings.transactionTypeLabel} </AppText>
                                <AppText style={styles.transactionTypeValue}>
                                    {formatTransactionType(transactionType)}
                                </AppText>
                            </View>
                        )}
                        {transactionData?.dateOfPayment && (
                            <View style={styles.transactionTypeDetailRow}>
                                <AppText style={styles.transactionTypeLabel}>{walletStrings.payoutDate} </AppText>
                                <AppText style={styles.transactionTypeValue}>
                                    {getLocalDateTime(transactionData?.dateOfPayment).date}
                                </AppText>
                            </View>
                        )}
                    </View>
                )}

                {/* Cost Breakdown Section */}
                <AppText style={styles.sectionTitle}>{walletStrings.costBreakdownTitle}</AppText>
                <View style={styles.costBreakdownCard}>
                    <View style={styles.costRow}>
                        <AppText style={styles.costLabel}>{walletStrings.totalCostTitle}</AppText>
                        <AppText style={styles.costValue}>{formatCurrency(transactionData?.jobCost || costBreakdown?.totalCost || 0)}</AppText>
                    </View>

                    {transactionType === 'paidToContractor' && Number(transactionData?.transactionFee || costBreakdown?.transactionFee || 0) > 0 && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{walletStrings.transactionFee || 'Transaction Fee'}</AppText>
                            <AppText style={styles.costValue}>{formatCurrency(transactionData?.transactionFee || costBreakdown?.transactionFee || 0)}</AppText>
                        </View>
                    )}

                    {transactionType !== 'paidToContractor' && Number(transactionData?.bookingFee || costBreakdown?.bookingFee || 0) > 0 && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{walletStrings.bookingFeeTitle}</AppText>
                            <AppText style={styles.costValue}> {formatCurrency(transactionData?.bookingFee || costBreakdown?.bookingFee || 0)}</AppText>
                        </View>
                    )}

                    {transactionData?.isPenaltyDeduction && Number(transactionData?.penaltyDeduction || costBreakdown?.penaltyDeduction || 0) > 0 && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{walletStrings.penaltyDeduction}</AppText>
                            <AppText style={[styles.costValue]}> {formatCurrency(transactionData?.penaltyDeduction || costBreakdown?.penaltyDeduction || 0)}</AppText>
                        </View>
                    )}
                    {(transactionData?.disputeFee || 0) > 0 && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{walletStrings.disbutFee}</AppText>
                            <AppText style={[styles.costValue]}> {formatCurrency(transactionData?.disputeFee || costBreakdown?.disputeFee || 0)}</AppText>
                        </View>
                    )}
                    <View style={styles.dashedDivider} />

                    <View style={styles.netPayableRow}>
                        <AppText style={styles.netPayableLabel}>{walletStrings.netPayableTitle}</AppText>
                        <View style={styles.netPayableValueRow}>
                            {type === 'credit' && (
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                    <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                            {type === 'debit' && (
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                    <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke={colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                            <AppText style={styles.netPayableValue}>{formatCurrency(totalPayableAmount || costBreakdown?.netPayable || 0)}</AppText>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default ContractorTransactionDetails;
