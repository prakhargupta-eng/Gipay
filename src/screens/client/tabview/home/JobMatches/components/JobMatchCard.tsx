// src/screens/client/tabview/home/JobMatches/components/JobMatchCard.tsx

import React, { useState } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import { View, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '@components/AppText';
import colors from '@styles/colors';
import styles from '../styles';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';

interface JobMatchCardProps {
    item: any;
    isPending: boolean;
    t: any;
    navigation: any;
    handleAction: (applicationId: string, action: 'accept' | 'reject') => void;
    actionLoadingState: { id: string, action: 'accept' | 'reject' } | null;
}


const AvatarImage = ({ source, style }: { source: any, style: any }) => {
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const fallbackSource = require('@assets/images/common/dummyUser.png');
    const imageSource = hasError ? fallbackSource : source;

    return (
        <View style={[style, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }]}>
            <FastImage
                source={imageSource}
                style={StyleSheet.absoluteFill}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setHasError(true);
                }}
            />
            {loading && !hasError && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
    );
};

export const JobMatchCard: React.FC<JobMatchCardProps> = ({
    item,
    isPending,
    t,
    navigation,
    handleAction,
    actionLoadingState,
}) => {
    const formattedStartDate = getLocalDateTime(item.jobStartDate).date;
    const formattedEndDate = getLocalDateTime(item.jobEndDate).date;

    // Fallback for missing avatar
    const avatarSource = item.contractorProfileImage
        ? { uri: item.contractorProfileImage }
        : require('@assets/images/common/dummyUser.png');

    const targetId = item.applicationId;
    const isRateNegotiated = item.isNegotiated || item.isProposeRate || item.isNegotiate || item.isRateProposed || !!item.proposedRate || !!item.counterOffer;
    const originalRate = item.originalHourlyRate || item.jobHourlyRate || item.originalOfferRate || 0;
    const negotiateRate = item.counterOffer || item.proposedRate || item.counterOfferRate || item.finalHourlyRate || 0;

    return (
        <View style={styles.card}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('JobMatchDetails', { jobData: item, isPending })}
            >
                {/* Header row */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <AvatarImage source={avatarSource} style={styles.avatar} />
                        <View style={styles.headerTextContainer}>
                            <AppText numberOfLines={1} style={styles.nameText}>{item.contractorName || 'Unknown Contractor'}</AppText>
                            <AppText numberOfLines={1} style={styles.hourlyRateText}>{t.hourlyRate} {formatCurrency(item.contractorHourlyRate || item.finalHourlyRate || item.proposedRate || item.originalHourlyRate || 0)}/h</AppText>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, getStatusStyles(isPending ? item.applicationStatus : item.matchStatus ).badge]}>
                        <AppText style={[styles.statusText, getStatusStyles(isPending ? item.applicationStatus : item.matchStatus ).text]}>
                            {getStatusStyles(isPending ? item.applicationStatus : item.matchStatus).label}
                        </AppText>
                    </View>
                </View>
                <View style={styles.Divider} />

                {/* Job Details */}
                <AppText style={styles.jobTitle}>{item.jobTitle}</AppText>

                <View style={styles.jobRateRow}>
                    <Image source={require('@assets/images/common/doller.png')} style={styles.iconSmall} />
                    <AppText style={[styles.jobRateText, isRateNegotiated && { textDecorationLine: 'line-through' }]}>
                        {t.jobRate} {formatCurrency(originalRate)}/h
                    </AppText>
                    {isRateNegotiated && (
                        <AppText style={[styles.jobRateText, { marginLeft: 8 }]}>
                            {item.finalRate || item.finalHourlyRate ? t.negotiatedRateLabel(negotiateRate) : t.proposedRateLabel(negotiateRate)}
                        </AppText>
                    )}
                </View>

                <View style={styles.dateTimeRow}>
                    <View style={[styles.dateItem]}>
                        <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
                        <AppText style={[styles.dateText, { flexShrink: 1 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {formattedStartDate} - {formattedEndDate}
                        </AppText>
                    </View>
                    <View style={[styles.dateItem]}>
                        <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
                        <AppText style={[styles.dateText, { flexShrink: 1 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                            {item.jobStartTime} - {item.jobEndTime}{item.totalHours || item.TotalHours ? ` (${item.totalHours || item.TotalHours}hrs)` : ''}
                        </AppText>
                    </View>
                </View>
            </TouchableOpacity>
            {isPending && (
                <>
                    {/* Divider */}
                    <View style={styles.dashedDivider} />

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, !!item.isNegotiate && { opacity: 0.5 }]}
                            onPress={() => handleAction(targetId, 'reject')}
                            disabled={actionLoadingState?.id === targetId || !!item.isNegotiate}
                        >
                            {actionLoadingState?.id === targetId && actionLoadingState?.action === 'reject' ? (
                                <ActivityIndicator size="small" color={colors.red} />
                            ) : (
                                <>
                                    <Image source={require('@assets/images/common/cancle.png')} style={styles.actionIcon} />
                                    <AppText style={[styles.actionText, { color: colors.red }]}>{t.decline}</AppText>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.verticalDivider} />

                        <TouchableOpacity
                            style={[styles.actionBtn, !!item.isNegotiate && { opacity: 0.5 }]}
                            onPress={() => handleAction(targetId, 'accept')}
                            disabled={actionLoadingState?.id === targetId || !!item.isNegotiate}
                        >
                            {actionLoadingState?.id === targetId && actionLoadingState?.action === 'accept' ? (
                                <ActivityIndicator size="small" color={colors.successGreen} />
                            ) : (
                                <>
                                    <Image source={require('@assets/images/common/check.png')} style={styles.actionIconRight} />
                                    <AppText style={[styles.actionText, { color: colors.successGreen }]}>{t.accept}</AppText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

export default JobMatchCard;
