import React from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings, { CURRENCY } from '@constants/strings';
import AppText from '@components/AppText';
import { getStatusStyles } from '@utils/statusUtils';

interface JobCardProps {
    title: string;
    company: string;
    date: string;
    time: string;
    rate: string;
    finalRate?: string;
    proposedRate?: string;
    address: string;
    status: string;
    showActions?: boolean;
    isClockedIn?: boolean;
    clockOutTime: string
    onClockIn?: () => void;
    onNavigation?: () => void;
    onPress?: () => void;
    fullWidth?: boolean;
    isCancelledJob?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
    title,
    company,
    date,
    time,
    rate,
    finalRate,
    proposedRate,
    address,
    status,
    showActions = false,
    isClockedIn = false,
    fullWidth = false,
    onClockIn,
    clockOutTime,
    onNavigation,
    onPress,
    isCancelledJob = false,
}) => {
    return (
        <View style={[styles.card, fullWidth && styles.fullWidthCard]}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} >
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1, marginRight: horizontalScale(8) }}>
                            <AppText style={styles.title} numberOfLines={2} ellipsizeMode="tail">{title}</AppText>
                        </View>
                        <View style={[styles.statusBadge, getStatusStyles(status).badge, { flexShrink: 0 }]}>
                            <AppText style={[styles.statusText, getStatusStyles(status).text]} numberOfLines={1}>{getStatusStyles(status).label}</AppText>
                        </View>
                    </View>
                    <AppText style={styles.company} numberOfLines={1} ellipsizeMode="tail">{company}</AppText>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Image source={require('@assets/images/common/calander.png')} style={styles.icon} />
                        <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{date}</AppText>
                    </View>
                    <View style={styles.detailItem}>
                        <Image source={require('@assets/images/common/blackClock.png')} style={styles.icon} />
                        <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{time}</AppText>
                    </View>
                </View>

                <View style={[styles.detailItem]}>
                    <Image source={require('@assets/images/common/doller.png')} style={styles.icon} />
                    {proposedRate ? (
                        <AppText style={[styles.detailText, { flex: 1 }]}>
                            {strings.auth.contractor.home.jobRateLabel || 'Job Rate:'}{' '}
                            <AppText style={[styles.detailText, { textDecorationLine: 'line-through', color: colors.gray }]}>
                                {formatCurrency(rate)}/h
                            </AppText> {' '}
                            {strings.auth.contractor.home.nagotiontedRate}
                            {' '}
                            {formatCurrency(finalRate)}/h
                        </AppText>
                    ) : (
                        <AppText style={[styles.detailText, { flex: 1 }]}>{strings.auth.contractor.home.jobRate(rate)}</AppText>
                    )}
                </View>

                <View style={[styles.detailItem, { alignItems: 'flex-start' }]}>
                    <Image source={require('@assets/images/common/pinLocation.png')} style={[styles.icon, { marginTop: verticalScale(2) }]} />
                    <AppText style={[styles.detailText, { flex: 1, paddingRight: horizontalScale(5) }]} numberOfLines={1} ellipsizeMode="tail">{address}</AppText>
                </View>
            </TouchableOpacity>
            {showActions && (
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.clockInBtn, (clockOutTime !== null || isCancelledJob) && { opacity: 0.5 }]}
                        onPress={onClockIn}
                        disabled={clockOutTime !== null || isCancelledJob}
                    >
                        <Image source={require('@assets/images/common/blackClock.png')} style={[styles.btnIcon, { tintColor: colors.primary }]} />
                        <AppText style={styles.clockInText} numberOfLines={1} ellipsizeMode="tail">{isClockedIn ? strings.auth.contractor.home.clockOut : strings.auth.contractor.home.clockIn}</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtn} onPress={onNavigation}>
                        <Image source={require('@assets/images/common/navigation.png')} style={[styles.btnIcon, { tintColor: colors.primary, width: verticalScale(20), height: verticalScale(25), marginRight: 2 }]} />

                        <AppText style={styles.navText} numberOfLines={1} ellipsizeMode="tail">{strings.auth.contractor.home.navigation}</AppText>
                    </TouchableOpacity>
                    <View style={styles.emptyView} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: Math.min(
            Dimensions.get('window').width - horizontalScale(40),
            Math.max(horizontalScale(337), Dimensions.get('window').width * 0.84)
        ),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginRight: horizontalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    fullWidthCard: {
        width: Dimensions.get('window').width - horizontalScale(40),
        marginRight: 0,
    },
    header: {
        marginBottom: verticalScale(16),
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(2),
    },
    title: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
    },
    statusBadge: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(6),
    },
    statusText: {
        fontSize: fontSize(11),
        fontFamily: fonts.semiBold,
    },
    company: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: colors.gray,
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: verticalScale(0),
        columnGap: horizontalScale(12),
        rowGap: verticalScale(2),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
        flexShrink: 1,
    },
    icon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(6),
        tintColor: colors.gray,

    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: colors.gray,
    },
    clockIcon: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#9CA3AF',
        marginRight: 6,
    },
    moneyIcon: {
        width: 14,
        height: 14,
        borderRadius: 2,
        backgroundColor: '#9CA3AF',
        marginRight: 6,
    },
    gpsIcon: {
        width: 10,
        height: 14,
        backgroundColor: '#9CA3AF',
        marginRight: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: horizontalScale(10),
        marginTop: verticalScale(8),
    },
    clockInBtn: {
        flex: 1,
        paddingHorizontal: horizontalScale(8),
        flexDirection: 'row',
        height: verticalScale(38),
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockInText: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: colors.primary,
        flexShrink: 1,
    },
    navBtn: {
        flex: 1,
        paddingHorizontal: horizontalScale(8),
        flexDirection: 'row',
        height: verticalScale(38),
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    navText: {
        fontSize: fontSize(13),
        fontFamily: fonts.regular,
        color: colors.primary,
        flexShrink: 1,
    },
    btnIconPlaceholder: {
        width: 10,
        height: 12,
        marginRight: 6,
    },
    btnIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        marginRight: horizontalScale(6),
        resizeMode: 'contain',
    },
    emptyView: {
        width: horizontalScale(50),
    },
});

export default JobCard;
