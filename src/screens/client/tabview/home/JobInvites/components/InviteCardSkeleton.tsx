import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const InviteCardSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Header Section */}
            <View style={styles.cardHeader}>
                <View>
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(18)} style={{ marginBottom: 6 }} />
                    <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
                </View>
                <SkeletonFrame width={horizontalScale(80)} height={verticalScale(24)} borderRadius={8} />
            </View>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Job Info Section */}
            <View style={styles.jobInfo}>
                <SkeletonFrame width={horizontalScale(180)} height={verticalScale(16)} style={{ marginBottom: 12 }} />
                
                <View style={styles.rateRow}>
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} />
                </View>

                <View style={styles.detailsRow}>
                    <SkeletonFrame width={horizontalScale(140)} height={verticalScale(14)} />
                    <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} style={{ marginLeft: horizontalScale(10) }} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: verticalScale(12),
    },
    jobInfo: {
        marginTop: verticalScale(2),
    },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default InviteCardSkeleton;
