import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const InviteDetailsSkeleton = () => {
    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Contractor Header */}
            <View style={styles.contractorHeader}>
                <SkeletonFrame width={horizontalScale(60)} height={horizontalScale(60)} borderRadius={30} />
                <View style={styles.headerInfo}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} style={{ marginBottom: 6 }} />
                    <SkeletonFrame width={horizontalScale(90)} height={verticalScale(14)} />
                </View>
                <SkeletonFrame width={horizontalScale(80)} height={verticalScale(24)} borderRadius={8} />
            </View>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Job Title & Company */}
            <View style={styles.titleSection}>
                <SkeletonFrame width={horizontalScale(200)} height={verticalScale(22)} style={{ marginBottom: 6 }} />
                <SkeletonFrame width={horizontalScale(140)} height={verticalScale(16)} />
            </View>

            {/* Job Details Grid */}
            <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                    <SkeletonFrame width={horizontalScale(160)} height={verticalScale(16)} />
                </View>
                <View style={styles.detailRow}>
                    <SkeletonFrame width={horizontalScale(220)} height={verticalScale(16)} />
                </View>
                <View style={styles.rowLayout}>
                    <SkeletonFrame width={horizontalScale(130)} height={verticalScale(16)} />
                    <SkeletonFrame width={horizontalScale(130)} height={verticalScale(16)} style={{ marginLeft: horizontalScale(10) }} />
                </View>
            </View>

            {/* About this Job */}
            <View style={styles.sectionContainer}>
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} style={{ marginBottom: 12 }} />
                <View style={styles.descBox}>
                    <SkeletonFrame width="100%" height={verticalScale(14)} style={{ marginBottom: 6 }} />
                    <SkeletonFrame width="100%" height={verticalScale(14)} style={{ marginBottom: 6 }} />
                    <SkeletonFrame width="80%" height={verticalScale(14)} />
                </View>
            </View>

            {/* Required Certification */}
            <View style={styles.sectionContainer}>
                <SkeletonFrame width={horizontalScale(160)} height={verticalScale(18)} style={{ marginBottom: 12 }} />
                <View style={styles.certBox}>
                    <SkeletonFrame width="90%" height={verticalScale(14)} style={{ marginBottom: 8 }} />
                    <SkeletonFrame width="80%" height={verticalScale(14)} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(40),
    },
    contractorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: horizontalScale(16),
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: verticalScale(20),
    },
    titleSection: {
        marginBottom: verticalScale(20),
    },
    detailsGrid: {
        gap: verticalScale(12),
        marginBottom: verticalScale(24),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLayout: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionContainer: {
        marginBottom: verticalScale(24),
    },
    descBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    certBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: horizontalScale(12),
        padding: horizontalScale(16),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});

export default InviteDetailsSkeleton;
