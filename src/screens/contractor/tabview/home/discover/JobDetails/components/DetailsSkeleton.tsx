import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale, SCREEN_WIDTH } from '@styles/mixins';
import colors from '@styles/colors';

const DetailsSkeleton = () => {
    return (
        <View style={styles.root}>
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Skeleton */}
                <View style={styles.header}>
                    <View style={styles.row}>
                        <SkeletonFrame width={SCREEN_WIDTH * 0.6} height={30} borderRadius={8} />
                        <SkeletonFrame width={60} height={25} borderRadius={12} />
                    </View>
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <SkeletonFrame width={SCREEN_WIDTH * 0.4} height={20} borderRadius={8} />
                        <SkeletonFrame width={40} height={20} borderRadius={8} />
                    </View>
                </View>

                {/* Tags Skeleton */}
                <View style={styles.tagsContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.tagRow}>
                            <SkeletonFrame width={20} height={20} borderRadius={10} />
                            <SkeletonFrame width={SCREEN_WIDTH * 0.7} height={18} borderRadius={4} style={{ marginLeft: 10 }} />
                        </View>
                    ))}
                </View>

                {/* Description Skeleton */}
                <View style={styles.section}>
                    <SkeletonFrame width={120} height={22} borderRadius={4} style={{ marginBottom: 15 }} />
                    <SkeletonFrame width={SCREEN_WIDTH - 40} height={100} borderRadius={12} />
                </View>

                {/* Certification Skeleton */}
                <View style={styles.section}>
                    <SkeletonFrame width={150} height={22} borderRadius={4} style={{ marginBottom: 15 }} />
                    <SkeletonFrame width={SCREEN_WIDTH - 40} height={80} borderRadius={12} />
                </View>

                {/* Contractor Count Skeleton */}
                <View style={[styles.row, styles.section]}>
                    <SkeletonFrame width={140} height={22} borderRadius={4} />
                    <SkeletonFrame width={50} height={44} borderRadius={10} />
                </View>
            </ScrollView>

            {/* Footer Skeleton */}
            <View style={styles.footer}>
                <SkeletonFrame width={(SCREEN_WIDTH - 52) / 2} height={54} borderRadius={12} />
                <SkeletonFrame width={(SCREEN_WIDTH - 52) / 2} height={54} borderRadius={12} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(120),
    },
    header: {
        marginBottom: verticalScale(24),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagsContainer: {
        marginBottom: verticalScale(32),
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    section: {
        marginBottom: verticalScale(28),
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(34),
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    }
});

export default DetailsSkeleton;
