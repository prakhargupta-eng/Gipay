import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
// src/screens/contractor/tabview/wallet/TransactionHistory/components/TransactionHistoryCard.tsx

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import Svg, { Path } from 'react-native-svg';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import { getStatusStyles, formatTransactionType } from '@utils/statusUtils';

interface TransactionHistoryCardProps {
    txnId: string;
    date: string;
    amount: string;
    payoutDate: string;
    status: string;
    transactionType?: string;
    type?: string;
    jobTitle?: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({
    txnId,
    date,
    amount,
    payoutDate,
    status,
    transactionType,
    type,
    jobTitle,
    
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const walletStrings = strings.auth.contractor.wallet;
    const statusStyle = getStatusStyles(status);

    const handlePress = () => {
        navigation.navigate('ContractorTransactionDetails', { txnId });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.txnInfo}>
                    <View style={styles.iconWrapper}>
                        <Image source={require('@assets/images/common/docPdf.png')} style={styles.txnIcon} />
                    </View>
                    <View style={{ flex: 1 }}>
                        {jobTitle && (
                            <AppText style={[styles.txnId, { color: colors.textDark }]} numberOfLines={1} ellipsizeMode='tail'>{jobTitle}</AppText>
                        )}
                        <AppText style={styles.txnDate} numberOfLines={1} ellipsizeMode="tail">{txnId}</AppText>
                        
                        <AppText style={styles.txnDate}>{date}</AppText>
                    </View>
                </View>
                <AppText style={styles.amount}>{formatCurrency(amount)}</AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <View style={styles.rowIconWrapper}>
                        <Image source={require('@assets/images/common/withdrawal.png')} style={styles.rowIcon} />
                    </View>
                    <AppText style={styles.label}>{transactionType ? formatTransactionType(transactionType) : walletStrings.withdrawalAmount}</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {type === 'credit' && (
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: horizontalScale(4) }}>
                            <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={colors.successGreen || '#22C55E'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    )}
                    {type === 'debit' && (
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: horizontalScale(4) }}>
                            <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="#FF4B4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    )}
                    <AppText style={styles.value}>{formatCurrency(amount)}</AppText>
                </View>
            </View>

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <View style={styles.rowIconWrapper}>
                        <Image source={require('@assets/images/common/payoutDate.png')} style={styles.rowIcon} />
                    </View>
                    <AppText style={styles.label}>{walletStrings.payoutDate}</AppText>
                </View>
                <AppText style={styles.value}>{payoutDate}</AppText>
            </View>

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <View style={styles.rowIconWrapper}>
                        <Image source={require('@assets/images/common/payoutStatus.png')} style={styles.rowIcon} />
                    </View>
                    <AppText style={styles.label}>{walletStrings.payoutStatus}</AppText>
                </View>
                <View style={[
                    styles.statusWrapper,
                    statusStyle.badge
                ]}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text.color }]} />
                    <AppText style={[styles.statusText, statusStyle.text]}>
                        {statusStyle.label}
                    </AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    txnInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: horizontalScale(16),
    },
    iconWrapper: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(12),
    },
    txnIcon: {
        width: horizontalScale(40),
        height: horizontalScale(40),
    },
    txnId: {
        fontSize: fontSize(14),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    txnDate: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    amount: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.primary,
        flexShrink: 0,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: verticalScale(12),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12), // Increased for better separation
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIconWrapper: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: horizontalScale(8),
    },
    rowIcon: {
        width: horizontalScale(24),
        height: horizontalScale(24),
    },
    label: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colors.gray,
    },
    value: {
        fontSize: fontSize(12),
        fontFamily: fonts.medium, // Bolder value
        color: colors.black,
    },
    statusWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(12),
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: fonts.medium,
    },
});

export default TransactionHistoryCard;
