import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import Colors from '@styles/colors';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';

const calendarIcon = require('@assets/images/common/calanderGray.png');
const clockIcon = require('@assets/images/common/clockGray.png');
const historyIcon = require('@assets/images/common/reload.png');
const tickIcon = require('@assets/images/common/squareRight.png');

interface JobAwaitingApprovalCardProps {
    item: any;
    isSelected?: boolean;
    onPress: () => void;
    onAdjustHours: () => void;
    onComplete: () => void;
    isCompleting?: boolean;
}

const JobAwaitingApprovalCard: React.FC<JobAwaitingApprovalCardProps> = ({
    item,
    isSelected,
    onPress,
    onAdjustHours,
    onComplete,
    isCompleting,
}) => {
    const t = strings.client.jobAwaitingApproval;
    const contractorName = item.contractorName || t.unknown;
    const jobTitle = item.jobTitle || t.jobRole;
    const hourlyRate =  `${formatCurrency(item.hourlyRate)}/h`;
    const statusStyle = getStatusStyles(item.statusLabel || item.status || t.pendingFallback);

    const dateStr = item.startDate ? `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}` : (item.date || '');
    const timeStr = item.startDate ? `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}` : (item.time || '');
    const clockInTime = item.clockInTime ? getLocalDateTime(item.clockInTime).date : null;

    return (
        <View style={[styles.card, isSelected && styles.cardSelected]}>
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeaderRow}>
                <AppText style={styles.nameText} numberOfLines={1}>{contractorName}</AppText>
                <View style={[styles.badgeContainer, statusStyle.badge]}>
                    <AppText style={[styles.badgeText, statusStyle.text]} numberOfLines={1}>{statusStyle.label}</AppText>
                </View>
            </View>

            <View style={styles.roleRow}>
                <AppText style={styles.roleText} numberOfLines={1}>{jobTitle}</AppText>
                <AppText style={styles.rateText} numberOfLines={1}>{hourlyRate}</AppText>
            </View>

            <View style={[styles.dateTimeRow, !clockInTime && { marginBottom: verticalScale(20) }]}>
                <View style={styles.dateItem}>
                    <Image source={calendarIcon} style={styles.iconSmall} />
                    <AppText style={styles.dateText}>{dateStr}</AppText>
                </View>
                <View style={styles.dateItem}>
                    <Image source={clockIcon} style={styles.iconSmall} />
                    <AppText style={styles.dateText}>{timeStr}</AppText>
                </View>
            </View>

            {clockInTime ? (
                <View style={styles.clockInRow}>
                    <Image source={clockIcon} style={styles.iconSmall} />
                    <AppText style={styles.clockInText}>
                        <AppText style={styles.clockInLabel}>{strings.client.manualClockIn?.clockInTime}: </AppText>
                        <AppText style={styles.clockInValue}>{clockInTime}</AppText>
                    </AppText>
                </View>
            ) : null}
        </TouchableOpacity>
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={[styles.actionBtn, (isCompleting || item.isAdjustHours === false) && { opacity: 0.5 }]} 
                    onPress={(e) => { e.stopPropagation(); onAdjustHours(); }} 
                    disabled={isCompleting || item.isAdjustHours === false}
                >
                    <Image source={historyIcon} style={styles.actionBtnIcon} />
                    <AppText style={styles.actionBtnText}>{t.adjustHours}</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, isCompleting && { opacity: 0.5 }]} 
                    onPress={(e) => { e.stopPropagation(); onComplete(); }}
                    disabled={isCompleting}
                >
                    {isCompleting ? null : <Image source={tickIcon} style={styles.actionBtnIcon} />}
                    <AppText style={styles.actionBtnText}>{isCompleting ? t.completing : t.markAsComplete}</AppText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(20),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardSelected: {
        borderColor: '#0EA5E9',
        borderWidth: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameText: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(16),
        color: Colors.black,
        flex: 1,
        marginRight: horizontalScale(10),
    },
    roleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(6),
        marginBottom: verticalScale(16),
    },
    roleText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: '#888888',
        flex: 1,
        marginRight: horizontalScale(10),
    },
    rateText: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(12),
        color: '#888888',
        flexShrink: 0,
    },
    badgeContainer: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(10),
        flexShrink: 1,
    },
    badgeText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    clockInRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    clockInText: {
        fontFamily: fonts.regular,
        fontSize: fontSize(12),
        color: '#888888',
    },
    clockInLabel: {
        fontFamily: fonts.medium,
        fontSize: fontSize(12),
        color: '#64748B',
    },
    clockInValue: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize(12),
        color: Colors.primary,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: horizontalScale(15),
    },
    iconSmall: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: '#94A3B8',
        marginRight: horizontalScale(6),
    },
    dateText: {
        fontFamily: fonts.light,
        fontSize: fontSize(12),
        color: '#888888',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
        borderRadius: horizontalScale(8),
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(14),
        marginRight: horizontalScale(10),
    },
    actionBtnIcon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        tintColor: Colors.primary,
        marginRight: horizontalScale(6),
    },
    actionBtnText: {
        fontFamily: fonts.medium,
        fontSize: fontSize(14),
        color: Colors.primary,
    },
});

export default JobAwaitingApprovalCard;
