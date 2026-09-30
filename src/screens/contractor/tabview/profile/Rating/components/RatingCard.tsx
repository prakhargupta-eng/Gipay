import React from 'react';
import { View, Image } from 'react-native';
import styles from '../styles';
import strings from '@constants/strings';
import { RatingData } from '../types';
import AppText from '@components/AppText';

const RatingCard = ({ item, isReceived }: { item: RatingData; isReceived: boolean }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.companyInfo}>
                <AppText style={styles.companyName} numberOfLines={1}>{item.company}</AppText>
                <AppText style={styles.jobText}>
                    {strings.auth.contractor.profile.ratingsData.jobTitleLabel} {item.jobTitle}
                </AppText>
            </View>
            <View style={styles.ratingBox}>
                <Image source={require('@assets/images/common/startIcon.png')} style={styles.starIcon} />
                <AppText style={styles.ratingText}>{item.rating}</AppText>
            </View>
        </View>

        <View style={styles.detailsRow}>
            <View style={styles.iconInfo}>
                <Image source={require('@assets/images/common/calander.png')} style={styles.detailIcon} />
                <AppText style={styles.detailText}>{item.date}</AppText>
            </View>
            <View style={[styles.iconInfo, { marginLeft: 16 }]}>
                <Image source={require('@assets/images/common/blackClock.png')} style={styles.detailIcon} />
                <AppText style={styles.detailText}>{item.time}</AppText>
            </View>
        </View>

        { item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <AppText style={styles.tagText}>{tag}</AppText>
                    </View>
                ))}
            </View>
        )}
    </View>
);

export default RatingCard;
