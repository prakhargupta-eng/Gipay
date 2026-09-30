// src/screens/client/tabview/home/DisputeHistory/DisputeDetails/components/DetailsSkeleton.tsx

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const DetailsSkeleton = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Dispute Info Card Skeleton */}
            <View style={styles.disputeCard}>
                <View style={styles.disputeHeader}>
                    <View style={styles.titleInfo}>
                        <SkeletonFrame width={horizontalScale(150)} height={verticalScale(20)} style={{ marginBottom: 8 }} />
                        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} style={{ marginBottom: 4 }} />
                        <SkeletonFrame width={horizontalScale(200)} height={verticalScale(16)} />
                    </View>
                    <SkeletonFrame width={horizontalScale(80)} height={verticalScale(28)} borderRadius={14} />
                </View>

                <View style={styles.section}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} style={{ marginBottom: 8 }} />
                    <SkeletonFrame width="100%" height={verticalScale(60)} />
                </View>

                <SkeletonFrame width={horizontalScale(140)} height={verticalScale(40)} borderRadius={10} style={{ marginTop: 16 }} />
            </View>

            {/* Job Info Section Skeleton */}
            <View>
                <SkeletonFrame width={horizontalScale(180)} height={verticalScale(24)} style={{ marginBottom: 6 }} />
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} style={{ marginBottom: 12 }} />
                
                <SkeletonFrame width={horizontalScale(40)} height={verticalScale(16)} style={{ marginBottom: 12 }} />

                <View style={styles.tagItem}>
                    <SkeletonFrame width={horizontalScale(150)} height={verticalScale(16)} />
                </View>

                <View style={styles.tagItem}>
                    <SkeletonFrame width="90%" height={verticalScale(16)} />
                </View>

                <View style={{ flexDirection: 'row', gap: 20 }}>
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(16)} />
                    <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} />
                </View>
            </View>

            {/* Description Box Skeleton */}
            <View style={styles.detailsGroup}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(20)} style={{ marginBottom: 10 }} />
                <SkeletonFrame width="100%" height={verticalScale(80)} borderRadius={16} />
            </View>

            {/* Required Certification Skeleton */}
            <View style={styles.detailsGroup}>
                <SkeletonFrame width={horizontalScale(160)} height={verticalScale(20)} style={{ marginBottom: 10 }} />
                <SkeletonFrame width="100%" height={verticalScale(100)} borderRadius={16} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: horizontalScale(20),
        paddingBottom: verticalScale(40),
    },
    disputeCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(24),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(16),
    },
    titleInfo: {
        flex: 1,
    },
    section: {
        marginTop: verticalScale(16),
    },
    tagItem: {
        marginBottom: verticalScale(12),
    },
    detailsGroup: {
        marginTop: verticalScale(24),
    },
});

export default DetailsSkeleton;
