import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import SkeletonFrame from '@components/SkeletonFrame';

const { width } = Dimensions.get('window');

const HomeSkeleton = () => {
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Dashboard Header Skeleton */}
                <View style={styles.dashboardSkeleton}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <View style={styles.userInfoRow}>
                                <SkeletonFrame width={horizontalScale(50)} height={horizontalScale(25)} borderRadius={4} style={{ marginRight: 12 }} />
                                <View style={styles.userNameContainer}>
                                    <SkeletonFrame width={horizontalScale(80)} height={verticalScale(14)} borderRadius={4} />
                                    <SkeletonFrame width={horizontalScale(160)} height={verticalScale(24)} borderRadius={4} style={{ marginTop: 6 }} />
                                </View>
                            </View>
                        </View>
                        <SkeletonFrame width={horizontalScale(44)} height={horizontalScale(44)} borderRadius={22} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                    </View>
                    
                    {/* Main Balance Card Skeleton */}
                    <View style={styles.mainBalanceCard}>
                        <View style={styles.balanceHeader}>
                            <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} borderRadius={4} />
                            <SkeletonFrame width={horizontalScale(100)} height={verticalScale(38)} borderRadius={20} style={{ backgroundColor: '#00C853', opacity: 0.5 }} />
                        </View>
                        <SkeletonFrame width={horizontalScale(200)} height={verticalScale(44)} borderRadius={8} style={{ marginTop: 4 }} />
                    </View>
                   
                </View>

                {/* Quick Actions Skeleton */}
                <View style={styles.quickActionsSkeleton}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} borderRadius={4} style={{ marginBottom: 20, marginLeft: horizontalScale(20) }} />
                    <View style={styles.quickActionsRow}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={styles.actionItem}>
                                <SkeletonFrame width={horizontalScale(50)} height={horizontalScale(50)} borderRadius={25} style={{ backgroundColor: '#F0EDFF' }} />
                                <SkeletonFrame width={horizontalScale(75)} height={verticalScale(12)} borderRadius={4} style={{ marginTop: 8 }} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Today's Jobs Skeleton */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <SkeletonFrame width={horizontalScale(110)} height={verticalScale(22)} borderRadius={4} />
                        <SkeletonFrame width={horizontalScale(50)} height={verticalScale(16)} borderRadius={4} />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {[1, 2].map((i) => (
                            <View key={i} style={styles.jobCard}>
                                <View style={styles.jobHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <SkeletonFrame width={horizontalScale(140)} height={verticalScale(20)} borderRadius={4} />
                                            <SkeletonFrame width={horizontalScale(70)} height={verticalScale(20)} borderRadius={6} />
                                        </View>
                                        <SkeletonFrame width={horizontalScale(90)} height={verticalScale(14)} borderRadius={4} style={{ marginTop: 8 }} />
                                    </View>
                                </View>
                                
                                <View style={styles.jobDetails}>
                                    <View style={styles.detailRow}>
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6 }} />
                                        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(12)} borderRadius={4} />
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6, marginLeft: 20 }} />
                                        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(12)} borderRadius={4} />
                                    </View>
                                    <View style={styles.detailRow}>
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6 }} />
                                        <SkeletonFrame width={horizontalScale(130)} height={verticalScale(12)} borderRadius={4} />
                                    </View>
                                    <View style={styles.detailRow}>
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6 }} />
                                        <SkeletonFrame width={horizontalScale(250)} height={verticalScale(12)} borderRadius={4} />
                                    </View>
                                </View>
                                
                                <View style={styles.jobButtons}>
                                    <SkeletonFrame width={horizontalScale(145)} height={verticalScale(38)} borderRadius={10} />
                                    <SkeletonFrame width={horizontalScale(145)} height={verticalScale(38)} borderRadius={10} style={{ marginLeft: 8 }} />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Upcoming Jobs Skeleton */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <SkeletonFrame width={horizontalScale(130)} height={verticalScale(22)} borderRadius={4} />
                        <SkeletonFrame width={horizontalScale(50)} height={verticalScale(16)} borderRadius={4} />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {[1, 2].map((i) => (
                            <View key={i} style={styles.jobCard}>
                                <View style={styles.jobHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <SkeletonFrame width={horizontalScale(140)} height={verticalScale(20)} borderRadius={4} />
                                            <SkeletonFrame width={horizontalScale(70)} height={verticalScale(20)} borderRadius={6} />
                                        </View>
                                        <SkeletonFrame width={horizontalScale(90)} height={verticalScale(14)} borderRadius={4} style={{ marginTop: 8 }} />
                                    </View>
                                </View>
                                
                                <View style={styles.jobDetails}>
                                    <View style={styles.detailRow}>
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6 }} />
                                        <SkeletonFrame width={horizontalScale(130)} height={verticalScale(12)} borderRadius={4} />
                                    </View>
                                    <View style={styles.detailRow}>
                                        <SkeletonFrame width={horizontalScale(14)} height={horizontalScale(14)} borderRadius={2} style={{ marginRight: 6 }} />
                                        <SkeletonFrame width={horizontalScale(250)} height={verticalScale(12)} borderRadius={4} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
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
    dashboardSkeleton: {
        width: width,
        paddingTop: verticalScale(60),
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.primary,
        borderBottomLeftRadius: horizontalScale(30),
        borderBottomRightRadius: horizontalScale(30),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    headerLeft: {
        flex: 1,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userNameContainer: {
        justifyContent: 'center',
    },
    mainBalanceCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: horizontalScale(24),
        padding: horizontalScale(20),
        marginBottom: verticalScale(20),
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: horizontalScale(20),
        marginBottom: verticalScale(20)
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
    },
    quickActionsSkeleton: {
        marginHorizontal: horizontalScale(20),
        marginTop: verticalScale(24),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24), // Matched to HomeScreen.tsx
        paddingVertical: verticalScale(20),
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
    section: {
        marginTop: verticalScale(24), // Matched to HomeScreen.tsx
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(20),
        marginBottom: verticalScale(16),
    },
    horizontalList: {
        paddingLeft: horizontalScale(20),
    },
    jobCard: {
        width: horizontalScale(337),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginRight: horizontalScale(16),
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    jobHeader: {
        marginBottom: verticalScale(16),
    },
    jobDetails: {
        gap: verticalScale(8),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobButtons: {
        flexDirection: 'row',
        marginTop: verticalScale(16),
    }
});

export default HomeSkeleton;
