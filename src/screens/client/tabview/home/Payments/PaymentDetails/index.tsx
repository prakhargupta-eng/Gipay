import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import FileViewer from 'react-native-file-viewer';
import { View, ScrollView, Image, StatusBar, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { horizontalScale } from '@styles/mixins';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import TopHeader from '@components/TopHeader';
import CustomButton from '@components/CustomButton';
import ConfirmationPopup from '@components/ConfirmationPopup';
import CopyableTransactionId from '@components/CopyableTransactionId';
import strings from '@constants/strings';
import colors from '@styles/colors';
import PaymentService from '@config/paymentService';
import PaymentDetailsSkeleton from './components/PaymentDetailsSkeleton';
import EmptyState from '@components/EmptyState';
import { Toast } from '@utils/ToastManager';
import { downloadInvoice } from '@utils/fileDownloader';
import styles from './styles';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles ,formatTransactionType} from '@utils/statusUtils';
import { devDebugger } from '@utils/devDebugger';

type RouteParams = RouteProp<ClientAppStackParamList, 'PaymentInvoiceDetails'>;

const PaymentInvoiceDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteParams>();
    const { transactionId } = route.params || {};

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [loading, setLoading] = useState(!!transactionId);
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(null);

    const t = strings.client.paymentsInvoices;

    const handleDownload = async () => {
        if (!transactionId) return;
        try {
            setIsDownloading(true);

            const url = PaymentService.getInvoiceDownloadUrl(transactionId);
            devDebugger.log(url, "======url====");

            const fileName = `Invoice_${transactionId}.pdf`;
            const savedPath = await downloadInvoice(url, fileName);
            if (savedPath) {
                setDownloadedFilePath(savedPath);
                setIsPopupVisible(true);
            }
        } catch (error) {
            devDebugger.error('Error in handleDownload:', error);
            Toast.show({ type: 'error', text2: t.failedToDownload });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleOpenFile = async () => {
        if (!downloadedFilePath) return;

        try {
            await FileViewer.open(downloadedFilePath, {
                showOpenWithDialog: true,
            });
        } catch (error: any) {
            devDebugger.error('Failed to open file:', error);
            if (error?.message?.includes('No app installed') || error?.message?.includes('No app associated')) {
                Toast.show({ type: 'error', text2: 'No PDF viewer installed on this device.' });
            } else {
                Toast.show({ type: 'error', text2: 'Failed to open the downloaded file.' });
            }
        }
    };

    useEffect(() => {
        if (transactionId) {
            fetchPaymentDetails();
        }
    }, [transactionId]);

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true);
            setHasError(false);
            const response = await PaymentService.getPaymentDetails(transactionId!);
            if (response.success && response.data) {
                // Determine actual data object
                const resData = response.data?.data || response.data;
                const details = resData.jobDetails || {};
                const contractor = resData.contractorDetails || {};

                // Map the backend data to component props format
                setInvoiceData({
                    ...resData,
                    invoiceNumber: resData.invoiceNumber || resData.transactionId || 'N/A',
                    jobRef: details.reference || resData.jobReference || 'N/A',
                    status: resData.paymentStatus || resData.status,
                    title: details.title || resData.jobTitle,
                    date: `${getLocalDateTime(details.startDate).date} - ${getLocalDateTime(details.endDate).date}`,
                    time: `${getLocalDateTime(details.startDate).time} - ${getLocalDateTime(details.endDate).time}`,
                    totalCost: resData.totalCost,
                    bookingFee: resData.bookingFee,
                    netPayable: resData.netPayable,
                    paidTo: {
                        name: contractor.name || resData.contractorName,
                        avatar: contractor.profileImage || resData.contractorProfileImage || null,
                        hourlyRate: contractor.hourlyRate || resData.contractorHourlyRate,
                        jobRate: details.jobRate
                    },
                    clockintDate: resData?.attendanceDetails?.clockInTime
                        ? getLocalDateTime(resData.attendanceDetails.clockInTime).date
                        : null,
                });
            } else {
                setHasError(true);
                Toast.show({ type: 'error', text2: response.message || t.failedToFetchDetails });
            }
        } catch (error: any) {
            devDebugger.error('Error fetching payment details:', error);
            setHasError(true);
            Toast.show({ type: 'error', text2: error.message || t.anErrorOccurred });
        } finally {
            setLoading(false);
        }
    };

    const hidePaidToSection = [
        'escrowFund',
        'refundUnusedEscrow',
        'refundAttendenceSettleEscrow',
        'refundNotInvitedJobEscrow',
        'refundUnallocatedEscrow',
        'cancelJob',
        'additionalEscrowAllocateRefund',
        'additionalEscrowAllocate'
    ].includes(invoiceData?.transactionType || '');

    const renderContent = () => {
        if (loading) {
            return <PaymentDetailsSkeleton />;
        }
        
        if (hasError || !invoiceData) {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <EmptyState 
                    imageSource={require('@assets/images/common/noData.png')}
                        title={t.noDetailsFoundTitle} 
                        description={t.noDetailsFoundDesc}
                    />
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Invoice Header */}
                <View style={styles.headerRow}>
                    <View style={{ flex: 1, paddingRight: horizontalScale(10), alignItems: 'flex-start' }}>
                        <AppText style={styles.invoiceLabel}>{t.invoiceNumber}</AppText>
                        <CopyableTransactionId 
                            transactionId={invoiceData?.invoiceNumber} 
                            textStyle={styles.invoiceValue}
                            style={{ alignItems: 'flex-start' }}
                        />
                    </View>
                    <View style={{ flex: 1, paddingLeft: horizontalScale(10), alignItems: 'flex-end' }}>
                        <AppText style={styles.jobRefLabel} numberOfLines={1} ellipsizeMode="tail">
                            {t.jobRef} {invoiceData?.jobRef}
                        </AppText>

                        <View style={[styles.statusBadge, getStatusStyles(invoiceData?.status || t.pending).badge]}>
                            <AppText style={[styles.statusText, getStatusStyles(invoiceData?.status || t.pending).text]}>
                                {getStatusStyles(invoiceData?.status).label}
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* Paid To Section */}
                {!hidePaidToSection && (
                    <>
                        <AppText style={styles.sectionTitle}>
                            {invoiceData?.transactionType !== 'paidToContractor' ? t.paidToBe : t.paidTo }
                        </AppText>
                        <View style={styles.paidToCard}>
                            <Image source={invoiceData?.paidTo?.avatar ? { uri: invoiceData.paidTo.avatar } : require('@assets/images/common/dummyUser.png')} style={styles.avatar} />
                            <View style={{ width: '85%' }}>
                                <AppText style={styles.paidToName} numberOfLines={1} ellipsizeMode="tail">{invoiceData?.paidTo?.name}</AppText>
                                <AppText style={styles.paidToRate}>{t.hourlyRate} {formatCurrency(Number(invoiceData?.paidTo?.hourlyRate))}/h</AppText>
                            </View>
                        </View>
                        <View style={styles.divider} />
                    </>
                )}

                {/* Job Details Section */}
                <View style={styles.jobDetailsCard}>
                    <View style={styles.jobTitleRow}>
                        <AppText style={styles.jobTitle}>{invoiceData?.title}</AppText>
                    </View>

                    <View style={styles.jobRateRow}>
                        <Image source={require('@assets/images/common/doller.png')} style={styles.iconSmall} />
                        <AppText style={styles.jobRateText}>{t.jobRateLabel}{formatCurrency(invoiceData?.paidTo?.jobRate)}/h</AppText>
                    </View>

                    <View style={styles.dateTimeRow}>
                        <View style={styles.dateItem}>
                            <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
                            <AppText style={styles.dateText}>{invoiceData?.date}</AppText>
                        </View>
                        <View style={styles.dateItem}>
                            <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
                            <AppText style={styles.dateText}>{invoiceData?.time}</AppText>
                        </View>
                    </View>

                    {invoiceData?.transactionType && (
                        <View style={styles.transactionTypeDetailRow}>
                            <AppText style={styles.transactionTypeLabel}>{t.transactionTypeLabel}</AppText>
                            <View style={styles.transactionTypeValueContainer}>
                                <AppText style={styles.transactionTypeValue}>
                                    {formatTransactionType(invoiceData.transactionType)}
                                </AppText>
                            </View>
                        </View>
                    )}
                    {invoiceData?.clockintDate && invoiceData.clockintDate !== 'N/A' && (
                        <View style={styles.clockintDateRow}>
                            <AppText style={styles.clockintDateLabel}>{t.jobDateLabel}</AppText>
                            <AppText style={styles.clockintDateValue}>{invoiceData.clockintDate}</AppText>
                        </View>
                    )}

                </View>

                {/* Cost Breakdown Section */}
                <AppText style={styles.sectionTitle}>{t.costBreakdown}</AppText>
                <View style={styles.costBreakdownCard}>
                    <View style={styles.costRow}>
                        <AppText style={styles.costLabel}>{t.totalCost}</AppText>
                        <AppText style={styles.costValue}>{formatCurrency(invoiceData?.jobCost ||0)}</AppText>
                    </View>


                    {Number(invoiceData?.bookingFee || invoiceData?.costBreakdown?.bookingFee || 0) > 0 && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{t.bookingFee}</AppText>
                            <AppText style={styles.costValue}>{formatCurrency(invoiceData?.bookingFee || invoiceData?.costBreakdown?.bookingFee || 0)}</AppText>
                        </View>
                    )}

                    {(invoiceData.transactionType === 'cancelJob') && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{t.cancletionFee || 'Fee'}</AppText>
                            <AppText style={styles.costValue}>{formatCurrency(invoiceData?.cancellationFee || 0)}</AppText>
                        </View>
                    )}
                    {(invoiceData?.disputeFee > 0) && (invoiceData.transactionType !== 'paidToContractor') && (
                        <View style={styles.costRow}>
                            <AppText style={styles.costLabel}>{t.disputeFee || 'Fee'}</AppText>
                            <AppText style={styles.costValue}>{formatCurrency(invoiceData?.disputeFee || 0)}</AppText>
                        </View>
                    )}
                    <View style={styles.dashedDivider} />

                    <View style={styles.netPayableRow}>
                        <AppText style={styles.netPayableLabel}>
                            {invoiceData?.transactionType?.toLowerCase().includes('refund') 
                                ? (t.refundAmount || 'Refund Amount') 
                                : (t.netPayable || 'Net Payable')}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {invoiceData?.type === 'credit' && (
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                    <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                            {invoiceData?.type === 'debit' && (
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                    <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke={colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                            <AppText style={[styles.netPayableValue, { color: colors.primary }]}>{formatCurrency(invoiceData?.totalPayableAmount || 0)}</AppText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={t.detailsTitle} onBack={() => navigation.goBack()} />

            {renderContent()}

            {!loading && invoiceData && (
                <View style={styles.bottomContainer}>
                    <CustomButton
                        title={t.downloadInvoice}
                        onPress={handleDownload}
                        loading={isDownloading}
                    />
                </View>
            )}

            <ConfirmationPopup
                visible={isPopupVisible}
                message={t.invoiceDownloadSuccess}
                subMessage={Platform.OS === 'ios' ? strings.common.fileDownloader.invoiceSavedIos : strings.common.fileDownloader.invoiceSavedDownloads}
                onConfirm={() => {
                    setIsPopupVisible(false);
                    setTimeout(() => {
                        handleOpenFile();
                    }, Platform.OS === 'ios' ? 600 : 100);
                }}
                onClose={() => setIsPopupVisible(false)}
                confirmText={"Open"}
                cancelText={t.done}
                hideCancelButton={false}
                animationSource={require('@assets/animation/Success Check.json')}
            />
        </View>
    );
};

export default PaymentInvoiceDetailsScreen;
