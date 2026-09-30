import { formatCurrency } from '@utils/currencyUtils';
// src/screens/contractor/tabview/wallet/ViewEarning/components/TransactionCard.tsx

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import { getStatusStyles  } from '@utils/statusUtils';

interface TransactionCardProps {
    title: string;
    transactionId: string;
    grossAmount: string;
    fee: string;
    netAmount: string;
    time: string;
    date: string;
    status: string;
    onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
    title,
    transactionId,
    grossAmount,
    fee,
    netAmount,
    time,
    date,
    status,
    onPress
}) => {
    const walletStrings = strings.auth.contractor.wallet;

    const theme = getStatusStyles(status);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
            <View style={styles.header}>
                <AppText style={styles.title}>{title}</AppText>
                <View style={[
                    styles.statusBadge, 
                    theme.badge
                ]}>
                    <AppText style={[
                        styles.statusText, 
                        theme.text
                    ]}>
                        {theme.label}
                    </AppText>
                </View>
            </View>
            
            <AppText style={styles.transactionId} numberOfLines={1}>{walletStrings.transactionId(transactionId)}</AppText>
            
            <View style={styles.divider} />

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <Image source={require('@assets/images/contractor/contractorTabIcon/wallet.png')} style={styles.icon} />
                    <AppText style={styles.label}>{walletStrings.grossAmountEarned}</AppText>
                </View>
                <AppText style={styles.value}>{formatCurrency(grossAmount)}</AppText>
            </View>

            {Number(fee) > 0 && (
                <View style={styles.detailRow}>
                    <View style={styles.labelWrapper}>
                        <Image source={require('@assets/images/common/transaction.png')} style={styles.icon} />
                        <AppText style={styles.label}>{walletStrings.fee}</AppText>
                    </View>
                    <AppText style={styles.value}>{formatCurrency(fee)}</AppText>
                </View>
            )}

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <Image source={require('@assets/images/common/netAmount.png')} style={styles.icon} />
                    <AppText style={styles.label}>{walletStrings.netAmount}</AppText>
                </View>
                <AppText style={styles.value}>{formatCurrency(netAmount)}</AppText>
            </View>

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <Image source={require('@assets/images/common/blackClock.png')} style={styles.icon} />
                    <AppText style={styles.label}>{walletStrings.jobTime}</AppText>
                </View>
                <AppText style={styles.value}>{time}</AppText>
            </View>

            <View style={styles.detailRow}>
                <View style={styles.labelWrapper}>
                    <Image source={require('@assets/images/common/calander.png')} style={styles.icon} />
                    <AppText style={styles.label}>{walletStrings.jobDate}</AppText>
                </View>
                <AppText style={styles.value}>{date}</AppText>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    title: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: fonts.bold,
    },
    transactionId: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
        marginBottom: verticalScale(12),
        marginRight: verticalScale(20)
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
        marginBottom: verticalScale(10),
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        marginRight: horizontalScale(8),
        tintColor: '#9CA3AF',
    },
    label: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#9CA3AF',
    },
    value: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#6B7280',
    },
});

export default TransactionCard;
