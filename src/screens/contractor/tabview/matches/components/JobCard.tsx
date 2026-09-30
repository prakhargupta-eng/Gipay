import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import colors from '@styles/colors';
import strings from '@constants/strings';
import styles from '../styles'; 
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';
import {horizontalScale} from '@styles/mixins';
const commonAssets = {
    starIcon: require('@assets/images/common/star.png'),
    calendarIcon: require('@assets/images/common/calanderGray.png'),
    clockIcon: require('@assets/images/common/clockGray.png'),
    dollarIcon: require('@assets/images/common/doller.png'),
    locationIcon: require('@assets/images/common/locationPin.png'),
    negotiateIcon: require('@assets/images/common/openEye.png'),
};

const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

interface JobCardProps {
    item: any;
    activeTab: string;
    onPress: () => void;
    onNegotiate: (item: any) => void;
}

const JobCard: React.FC<JobCardProps> = ({ item, activeTab, onPress, onNegotiate }) => {
    const s = strings.auth.contractor.matches;
    const statusText = capitalize(item.matchStatus) || (activeTab === s.pending ? 'Pending' : 'Confirmed');
    const isConfirmed = statusText === 'Confirmed';
    
    return (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9}
            onPress={onPress}
        >
            <View style={styles.cardHeader}>
                <AppText style={styles.jobTitle} numberOfLines={1}>{item.title || item.jobTitle || 'Unknown Job'}</AppText>
                <View style={[
                    styles.statusBadge,
                    getStatusStyles(item.matchStatus || statusText).badge
                ]}>
                    <AppText style={[
                        styles.statusText,
                        getStatusStyles(item.matchStatus || statusText).text
                    ]}>
                        {getStatusStyles(item.matchStatus || statusText).label}
                    </AppText>
                </View>
            </View>
            <AppText style={styles.companyName}>{item.organizationName || item.company || 'Unknown'}</AppText>

            {(() => {
                const ratingVal = item.organizationRating || item.rating;
                const hasRating = ratingVal && parseFloat(ratingVal) > 0;
                return hasRating ? (
                    <View style={styles.ratingRow}>
                        <Image source={commonAssets.starIcon} style={styles.starIcon} />
                        <AppText style={styles.ratingText}>{ratingVal}</AppText>
                    </View>
                ) : null;
            })()}

            <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Image source={commonAssets.calendarIcon} style={styles.infoIcon} />
                        <AppText style={styles.infoText}>{(item.startDate || item.dateRange) && item.endDate ? `${getLocalDateTime(item.startDate || item.dateRange).date} - ${getLocalDateTime(item.endDate).date}` : 'N/A'}</AppText>
                    </View>
                    <View style={styles.infoItem}>
                        <Image source={commonAssets.clockIcon} style={styles.infoIcon} />
                        <AppText style={styles.infoText}>{(item.startDate && item.endDate) ? `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}` : 'N/A'}</AppText>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Image source={commonAssets.dollarIcon} style={styles.infoIcon} />
                    {item.isProposeRate || item.isNegotiated ? (
                        <View style={styles.negotiationRatesContainer}>
                            <AppText style={styles.originalRateText}>
                                {s.jobRate(item.originalHourlyRate || item.hourlyRate)}
                            </AppText>
                            {item.finalHourlyRate ? (
                                <AppText style={styles.negotiatedRateText}>
                                {s.negotiatedRate(item.finalHourlyRate || item.hourlyRate)}
                            </AppText>
                            ) : (
                                <AppText style={styles.negotiatedRateText}>
                                {s.proposedRate(item.proposedRate || item.hourlyRate)}
                            </AppText>
                            )}
                        </View>
                    ) : (
                        <AppText style={styles.infoText}>{s.hourlyRate( item.originalHourlyRate || item.hourlyRate || item.rate || 0)}</AppText>
                    )}
                </View>
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                    <Image source={commonAssets.locationIcon} style={[styles.infoIcon, { marginTop: 2 }]} />
                    <AppText style={[styles.infoText,{marginRight:horizontalScale(20)}]} >{item.location}</AppText>
                </View>
            </View>

            {item.showNegotiationButton && (
                <TouchableOpacity 
                    style={styles.negotiateBtn} 
                    activeOpacity={0.7}
                    onPress={(e) => {
                        e.stopPropagation(); 
                        onNegotiate(item);
                    }}
                >
                    <Image source={commonAssets.negotiateIcon} style={styles.negotiateIcon} />
                    <AppText style={styles.negotiateText}>{s.negotiate}</AppText>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

export default JobCard;
