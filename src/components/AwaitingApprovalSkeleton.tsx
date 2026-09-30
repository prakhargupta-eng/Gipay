import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonFrame from './SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const AwaitingApprovalSkeleton = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header / Main Profile Info */}
            <View style={styles.headerSection}>
                <SkeletonFrame width={60} height={60} borderRadius={30} style={{ marginBottom: 12 }} />
                <SkeletonFrame width={150} height={20} style={{ marginBottom: 8 }} />
                <SkeletonFrame width={100} height={16} />
            </View>

            {/* Details Section */}
            <View style={styles.detailsCard}>
                <View style={styles.row}>
                    <SkeletonFrame width={100} height={16} />
                    <SkeletonFrame width={120} height={16} />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <SkeletonFrame width={100} height={16} />
                    <SkeletonFrame width={80} height={16} />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <SkeletonFrame width={100} height={16} />
                    <SkeletonFrame width={140} height={16} />
                </View>
            </View>

            {/* Time Logs */}
            <View style={styles.timeSection}>
                <SkeletonFrame width={120} height={18} style={{ marginBottom: 16 }} />
                <View style={styles.timeRow}>
                    <SkeletonFrame width={80} height={14} />
                    <SkeletonFrame width={60} height={14} />
                </View>
                <View style={styles.timeRow}>
                    <SkeletonFrame width={80} height={14} />
                    <SkeletonFrame width={60} height={14} />
                </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.actionSection}>
                <SkeletonFrame width="100%" height={50} borderRadius={25} style={{ marginBottom: 16 }} />
                <SkeletonFrame width="100%" height={50} borderRadius={25} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: verticalScale(24),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailsCard: {
        backgroundColor: colors.white,
        margin: horizontalScale(16),
        padding: horizontalScale(16),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    timeSection: {
        backgroundColor: colors.white,
        marginHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
        padding: horizontalScale(16),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    actionSection: {
        padding: horizontalScale(16),
        marginTop: verticalScale(20),
        marginBottom: verticalScale(40),
    }
});

export default AwaitingApprovalSkeleton;
