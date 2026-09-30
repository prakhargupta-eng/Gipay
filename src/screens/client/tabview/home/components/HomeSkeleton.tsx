import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import SkeletonFrame from '@components/SkeletonFrame';

const HomeSkeleton = () => {
    return (
        <View style={styles.root}>
           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header Skeleton */}
                <View style={styles.headerSkeleton}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <View style={{ marginTop: 12, flexDirection: "row", gap: 5 }}>
                                <SkeletonFrame width={horizontalScale(50)} height={verticalScale(50)} borderRadius={4} />
                                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(24)} borderRadius={4} style={{ marginTop: 8 }} />
                            </View>
                        </View>
                        <SkeletonFrame width={horizontalScale(44)} height={horizontalScale(44)} borderRadius={22} />
                    </View>
                    
                    {/* Escrow Card Skeleton */}
                    <View style={styles.escrowCard}>
                        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={4} />
                        <SkeletonFrame width={horizontalScale(140)} height={verticalScale(40)} borderRadius={4} style={{ marginTop: 8 }} />
                    </View>
                </View>

                {/* Stats Grid Skeleton */}
                <View style={styles.statsSection}>
                    {[1, 2].map((row) => (
                        <View key={row} style={styles.statsRow}>
                            {[1, 2].map((col) => (
                                <View key={col} style={{ flex: 1, marginHorizontal: horizontalScale(6) }}>
                                    <SkeletonFrame 
                                        width={'100%'} 
                                        height={verticalScale(70)} 
                                        borderRadius={16} 
                                    />
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Quick Actions Skeleton */}
                <View style={styles.quickActionsSkeleton}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(20)} borderRadius={4} style={{ marginBottom: 20 }} />
                    <View style={styles.quickActionsRow}>
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} style={styles.actionItem}>
                                <SkeletonFrame width={horizontalScale(50)} height={horizontalScale(50)} borderRadius={12} />
                                <SkeletonFrame width={horizontalScale(60)} height={verticalScale(12)} borderRadius={4} style={{ marginTop: 8 }} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Payments Skeleton */}
                <View style={styles.recentPaymentsSection}>
                    <View style={styles.sectionHeader}>
                        <SkeletonFrame width={horizontalScale(140)} height={verticalScale(24)} borderRadius={4} />
                        <SkeletonFrame width={horizontalScale(60)} height={verticalScale(16)} borderRadius={4} />
                    </View>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.paymentItem}>
                            <SkeletonFrame width={horizontalScale(40)} height={horizontalScale(40)} borderRadius={20} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} borderRadius={4} />
                                <SkeletonFrame width={horizontalScale(80)} height={verticalScale(12)} borderRadius={4} style={{ marginTop: 6 }} />
                            </View>
                            <SkeletonFrame width={horizontalScale(60)} height={verticalScale(20)} borderRadius={4} />
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingBottom: verticalScale(120),
    },
    headerSkeleton: {
        height: verticalScale(300),
        paddingTop: verticalScale(60),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    escrowCard: {
        marginTop: verticalScale(40),
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 24,
        padding: 20,
    },
    statsSection: {
        marginTop: verticalScale(30), // Pull up into the header
        paddingHorizontal: horizontalScale(20),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    quickActionsSkeleton: {
        marginHorizontal: horizontalScale(20),
        marginTop: verticalScale(24),
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionItem: {
        alignItems: 'center',
    },
    recentPaymentsSection: {
        marginTop: verticalScale(32),
        paddingHorizontal: horizontalScale(20),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    }
});

export default HomeSkeleton;
