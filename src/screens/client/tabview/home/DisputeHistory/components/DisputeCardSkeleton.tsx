// src/screens/client/tabview/home/DisputeHistory/components/DisputeCardSkeleton.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const DisputeCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleInfo}>
                    <SkeletonFrame width={horizontalScale(150)} height={verticalScale(20)} style={{ marginBottom: 4 }} />
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} style={{ marginBottom: 4 }} />
                    <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
                </View>
                <SkeletonFrame width={horizontalScale(90)} height={verticalScale(24)} borderRadius={12} />
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(16)} />
                </View>
                <View style={styles.detailItem}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} />
                </View>
            </View>

            <SkeletonFrame width={horizontalScale(140)} height={verticalScale(36)} borderRadius={10} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    titleInfo: {
        flex: 1,
    },
    detailsContainer: {
        gap: verticalScale(8),
        marginBottom: verticalScale(16),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default DisputeCardSkeleton;
