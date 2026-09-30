import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, ImageBackground } from 'react-native';

import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';

import strings from '@constants/strings';
import AppText from '@components/AppText';

const { width } = Dimensions.get('window');

interface BalanceDashboardProps {
    name: string;
    totalBalance: string;
    pendingAmount: string;
    completedAmount: string;
    onWithdraw?: () => void;
    onNotification?: () => void;
    unreadCount?: number;
}

const BalanceDashboard: React.FC<BalanceDashboardProps> = ({
    name,
    totalBalance,
    pendingAmount,
    completedAmount,
    onWithdraw,
    onNotification,
    unreadCount,
}) => {
    return (
        <ImageBackground
            source={require('@assets/images/contractor/homeTopBg.png')}
            style={styles.container}
            resizeMode="cover"
        >

            <View style={styles.headerRow}>
                <View style={styles.userInfo}>
                    <Image
                        source={require('@assets/images/app/appIconWhite.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.userNameContainer}>
                        <AppText style={styles.greeting}>{strings.client.home.greeting}</AppText>
                        <AppText style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{name}</AppText>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationBtn} onPress={onNotification}>
                    <View style={styles.notificationCircle}>
                        <Image
                            source={require('@assets/images/common/bell.png')}
                            style={styles.bellPlaceholder}
                            resizeMode="contain"
                        />
                    </View>
                    {/* Render badge overlay only if unreadCount is defined and greater than 0 */}
                    {unreadCount !== undefined && unreadCount > 0 && (
                        <View style={styles.badge}>
                            <AppText style={styles.badgeText}>
                                {/* Format: exact count if less than 9, otherwise show "9+" */}
                                {unreadCount >= 9 ? '9+' : unreadCount}
                            </AppText>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Total Balance Card ── */}
            <View style={styles.mainBalanceCard}>
                <View style={styles.balanceHeader}>
                    <AppText style={styles.balanceLabel}>{strings.auth.contractor.home.totalBalanceLabel}</AppText>
                    <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdraw}>
                        <AppText style={styles.withdrawText}>{strings.auth.contractor.home.withdraw}</AppText>
                    </TouchableOpacity>
                </View>
                <AppText style={styles.balanceAmount}>{formatCurrency(totalBalance)}</AppText>
            </View>

            
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        paddingTop: verticalScale(60),
        paddingHorizontal: horizontalScale(20),
        paddingBottom: verticalScale(25),
        borderBottomLeftRadius: horizontalScale(30),
        borderBottomRightRadius: horizontalScale(30),
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: horizontalScale(16),
    },
    logo: {
        width: horizontalScale(50),
        height: horizontalScale(25),
        marginRight: horizontalScale(12),
        tintColor: colors.white,
    },
    userNameContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    greeting: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: 'rgba(255,255,255,0.7)',
    },
    userName: {
        fontSize: fontSize(20),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    notificationBtn: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(22),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationCircle: {
        width: horizontalScale(18),
        height: horizontalScale(18),
    },
    bellPlaceholder: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: verticalScale(4),
        right: horizontalScale(4),
        backgroundColor: colors.red,
        borderRadius: horizontalScale(8),
        minWidth: horizontalScale(16),
        height: verticalScale(16),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(4),
        borderWidth: 1,
        borderColor: colors.white,
    },
    badgeText: {
        color: colors.white,
        fontSize: fontSize(9),
        fontFamily: fonts.bold,
        lineHeight: fontSize(10),
    },
    mainBalanceCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: horizontalScale(24),
        padding: horizontalScale(10),
        marginBottom: verticalScale(20),
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(0),
    },
    balanceLabel: {
        fontSize: fontSize(16),
        fontFamily: fonts.medium,
        color: colors.white,
    },
    balanceAmount: {
        fontSize: fontSize(40),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    withdrawBtn: {
        backgroundColor: '#00C853',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: horizontalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    withdrawText: {
        fontSize: fontSize(14),
        fontFamily: fonts.bold,
        color: colors.white,
    },
    statsRow: {
        flexDirection: 'row',
        gap: horizontalScale(20),
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: horizontalScale(16),
        padding: horizontalScale(10),
    },
    statLabel: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        marginBottom: verticalScale(4),
    },
    statAmount: {
        fontSize: fontSize(24),
        fontFamily: fonts.bold,
        color: colors.white,
        marginBottom: verticalScale(2),
    },
    statSubText: {
        fontSize: fontSize(11),
        fontFamily: fonts.regular,
        color: colors.white,
    },
});

export default BalanceDashboard;
