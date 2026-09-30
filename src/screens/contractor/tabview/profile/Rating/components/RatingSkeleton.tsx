import React from 'react';
import { View } from 'react-native';
import styles from '../styles';
import { horizontalScale, verticalScale } from '@styles/mixins';
import SkeletonFrame from '@components/SkeletonFrame';

const RatingSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.companyInfo}>
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(20)} />
                <SkeletonFrame width={horizontalScale(180)} height={verticalScale(14)} style={{ marginTop: 8 }} />
            </View>
            <SkeletonFrame width={horizontalScale(40)} height={verticalScale(20)} borderRadius={4} />
        </View>
        <View style={styles.detailsRow}>
            <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
            <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} style={{ marginLeft: horizontalScale(16) }} />
        </View>
        <View style={styles.tagsContainer}>
            <SkeletonFrame width={horizontalScale(60)} height={verticalScale(24)} borderRadius={8} />
            <SkeletonFrame width={horizontalScale(80)} height={verticalScale(24)} borderRadius={8} />
            <SkeletonFrame width={horizontalScale(70)} height={verticalScale(24)} borderRadius={8} />
        </View>
    </View>
);

export default RatingSkeleton;
