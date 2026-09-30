import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import styles from '../styles'; // Reuse styles from parent

const JobMatchSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Header Section */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <SkeletonFrame width={horizontalScale(44)} height={horizontalScale(44)} borderRadius={horizontalScale(22)} style={{ marginRight: horizontalScale(12) }} />
                    <View style={styles.headerTextContainer}>
                        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} style={{ marginBottom: verticalScale(4) }} />
                        <SkeletonFrame width={horizontalScale(80)} height={verticalScale(13)} />
                    </View>
                </View>
                <SkeletonFrame width={horizontalScale(70)} height={verticalScale(24)} borderRadius={horizontalScale(6)} />
            </View>
            
            <View style={styles.Divider} />

            {/* Job Details */}
            <SkeletonFrame width={horizontalScale(150)} height={verticalScale(16)} style={{ marginBottom: verticalScale(8) }} />
            
            <View style={styles.jobRateRow}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
            </View>

            <View style={styles.dateTimeRow}>
                <SkeletonFrame width={horizontalScale(110)} height={verticalScale(14)} style={{ marginRight: horizontalScale(10) }} />
                <SkeletonFrame width={horizontalScale(130)} height={verticalScale(14)} />
            </View>

            {/* Actions Divider */}
            <View style={styles.dashedDivider} />

            <View style={styles.actionRow}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(20)} borderRadius={horizontalScale(4)} />
                <View style={styles.verticalDivider} />
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(20)} borderRadius={horizontalScale(4)} />
            </View>
        </View>
    );
};

export default JobMatchSkeleton;
