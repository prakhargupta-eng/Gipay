import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { verticalScale, horizontalScale } from '@styles/mixins';

const PaymentDetailsSkeleton = () => {
    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Invoice Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(24) }}>
                <View>
                    <SkeletonFrame width={100} height={14} style={{ marginBottom: 8 }} />
                    <SkeletonFrame width={150} height={20} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <SkeletonFrame width={120} height={14} style={{ marginBottom: 8 }} />
                    <SkeletonFrame width={80} height={24} borderRadius={12} />
                </View>
            </View>

            {/* Paid To Title */}
            <SkeletonFrame width={80} height={16} style={{ marginBottom: verticalScale(12) }} />

            {/* Paid To Card */}
            <SkeletonFrame width="100%" height={80} borderRadius={20} style={{ marginBottom: verticalScale(24) }} />

            {/* Divider */}
            <SkeletonFrame width="100%" height={1} style={{ marginBottom: verticalScale(24) }} />

            {/* Job Details Card */}
            <SkeletonFrame width="100%" height={160} borderRadius={20} style={{ marginBottom: verticalScale(24) }} />

            {/* Cost Breakdown Title */}
            <SkeletonFrame width={120} height={16} style={{ marginBottom: verticalScale(12) }} />

            {/* Cost Breakdown Card */}
            <SkeletonFrame width="100%" height={180} borderRadius={20} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(40),
    }
});

export default PaymentDetailsSkeleton;
