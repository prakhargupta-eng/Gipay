import React from 'react';
import { View, Dimensions } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import styles from '../styles';
import { horizontalScale, verticalScale } from '@styles/mixins';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Screen width minus list padding (20 on each side) minus card padding (16 on each side)
const CONTENT_WIDTH = SCREEN_WIDTH - horizontalScale(40) - horizontalScale(32);

const InvitationCellSkeleton = () => {
    return (
        <View style={styles.skeletonCard}>
            <View style={styles.skeletonCardHeader}>
                <SkeletonFrame width={CONTENT_WIDTH * 0.6} height={verticalScale(18)} />
                <SkeletonFrame width={horizontalScale(60)} height={verticalScale(24)} borderRadius={12} />
            </View>
            <SkeletonFrame width={CONTENT_WIDTH * 0.4} height={verticalScale(14)} style={{ marginBottom: verticalScale(8) }} />
            <SkeletonFrame width={CONTENT_WIDTH * 0.8} height={verticalScale(14)} style={{ marginBottom: verticalScale(16) }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonFrame width={CONTENT_WIDTH * 0.3} height={verticalScale(14)} />
                <SkeletonFrame width={CONTENT_WIDTH * 0.3} height={verticalScale(14)} />
            </View>
            <View style={styles.skeletonCardFooter}>
                <SkeletonFrame width={CONTENT_WIDTH * 0.4} height={verticalScale(16)} />
                <View style={{ flexDirection: 'row' }}>
                    <SkeletonFrame width={horizontalScale(32)} height={horizontalScale(32)} borderRadius={16} style={{ marginRight: 8 }} />
                    <SkeletonFrame width={horizontalScale(32)} height={horizontalScale(32)} borderRadius={16} />
                </View>
            </View>
        </View>
    );
};

export default InvitationCellSkeleton;
