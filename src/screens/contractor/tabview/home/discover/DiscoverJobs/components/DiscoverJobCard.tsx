import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import styles from '../styles';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import { getStatusStyles } from '@utils/statusUtils';

interface DiscoverJobCardProps {
    id?: string | number;
    title: string;
    company: string;
    rating: string;
    distance: string;
    dateRange: string;
    time: string;
    rate: string;
    address: string;
    status: string;
    onPress?: () => void;
}

const DiscoverJobCard: React.FC<DiscoverJobCardProps> = ({
    id,
    title,
    company,
    rating,
    distance,
    dateRange,
    time,
    rate,
    address,
    status,
    onPress,
}) => {
    const statusStyle = getStatusStyles(status);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <AppText style={styles.jobTitle}numberOfLines={1}>{title}</AppText>
                    <AppText style={styles.companyName}numberOfLines={1}>{company}</AppText>
                </View>
                <View style={[
                    styles.badge, 
                    statusStyle.badge
                ]}>
                    <AppText style={[
                        styles.badgeText, 
                        statusStyle.text
                    ]}>
                        {statusStyle.label}
                    </AppText>
                </View>
            </View>

            <View style={styles.cardRow}>
                {rating !== '0' && rating !== '0.0' ? (
                    <>
                        <View style={styles.ratingContainer}>
                            <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
                            <AppText style={styles.ratingText}>{rating}</AppText>
                        </View>
                        <AppText style={styles.separator}>|</AppText>
                    </>
                ) : (
                    <Image source={require('@assets/images/common/map.png')} style={[styles.starIcon, { tintColor: '#9CA3AF' }]} />
                )}
                <AppText style={styles.distanceText}>{distance}</AppText>
            </View>

            <View style={styles.infoGrid}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <View style={[styles.infoItem, { marginRight: 16 }]}>
                        <Image source={require('@assets/images/common/calanderGray.png')} style={styles.infoIcon} />
                        <AppText style={[styles.infoText, { flex: 0 }]}>{dateRange}</AppText>
                    </View>
                    <View style={[styles.infoItem, { flex: 0 }]}>
                        <Image source={require('@assets/images/common/clockGray.png')} style={styles.infoIcon} />
                        <AppText style={[styles.infoText, { flex: 0 }]}>{time}</AppText>
                    </View>
                </View>
                <View style={styles.infoItem}>
                    <Image source={require('@assets/images/common/doller.png')} style={styles.infoIcon} />
                    <AppText style={styles.infoText}>{strings.auth.contractor.discover.jobRate(rate)}</AppText>
                </View>
                <View style={[styles.infoItem, { alignItems: 'flex-start' }]}>
                    <Image source={require('@assets/images/common/pinLocation.png')} style={styles.infoIcon} />
                    <AppText style={styles.infoText}>{address}</AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default DiscoverJobCard;
