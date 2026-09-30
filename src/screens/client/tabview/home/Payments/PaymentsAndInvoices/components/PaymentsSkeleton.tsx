import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';

const PaymentsSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <SkeletonFrame width={horizontalScale(32)} height={horizontalScale(32)} borderRadius={horizontalScale(16)} />
                    <View style={styles.titleContainer}>
                        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} borderRadius={4} />
                        <View style={{ height: verticalScale(4) }} />
                        <SkeletonFrame width={horizontalScale(80)} height={verticalScale(12)} borderRadius={4} />
                    </View>
                </View>
                <SkeletonFrame width={horizontalScale(60)} height={verticalScale(24)} borderRadius={horizontalScale(12)} />
            </View>

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} borderRadius={4} />
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} borderRadius={4} />
            </View>

            <View style={styles.divider} />

            {/* Costs */}
            <View style={styles.costRow}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={4} />
                <SkeletonFrame width={horizontalScale(60)} height={verticalScale(16)} borderRadius={4} />
            </View>

            <View style={styles.costRow}>
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} borderRadius={4} />
                <SkeletonFrame width={horizontalScale(60)} height={verticalScale(16)} borderRadius={4} />
            </View>

            <View style={styles.divider} />

            {/* Net Payable */}
            <View style={styles.netPayableRow}>
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} borderRadius={4} />
                <SkeletonFrame width={horizontalScale(70)} height={verticalScale(18)} borderRadius={4} />
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
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: horizontalScale(12),
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: horizontalScale(20),
        marginBottom: verticalScale(16),
    },
    divider: {
        height: 1,
        backgroundColor: colors.statBorder,
        marginVertical: verticalScale(12),
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    netPayableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
});

export default PaymentsSkeleton;
