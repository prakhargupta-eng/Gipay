import React from 'react';
import { View, ScrollView } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import styles from '../styles';

const JobMatchDetailsSkeleton = () => {
    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View>
                    <SkeletonFrame width={horizontalScale(150)} height={verticalScale(20)} style={{ marginBottom: verticalScale(8) }} />
                    <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
                </View>
                <SkeletonFrame width={horizontalScale(80)} height={verticalScale(28)} borderRadius={horizontalScale(6)} />
            </View>

            <View style={styles.divider} />

            {/* Job Title & Negotiate */}
            <View style={styles.jobTitleRow}>
                <SkeletonFrame width={horizontalScale(160)} height={verticalScale(20)} />
                <SkeletonFrame width={horizontalScale(100)} height={verticalScale(16)} />
            </View>
            <SkeletonFrame width={horizontalScale(120)} height={verticalScale(14)} style={{ marginBottom: verticalScale(16) }} />

            {/* Job Details Rows */}
            <View style={styles.iconRow}>
                <SkeletonFrame width={horizontalScale(180)} height={verticalScale(16)} />
            </View>
            <View style={styles.iconRow}>
                <SkeletonFrame width={horizontalScale(250)} height={verticalScale(16)} />
            </View>
            <View style={[styles.iconRow, { marginBottom: 0 }]}>
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} style={{ marginRight: horizontalScale(16) }} />
                <SkeletonFrame width={horizontalScale(120)} height={verticalScale(16)} />
            </View>

            {/* About this Job */}
            <SkeletonFrame width={horizontalScale(140)} height={verticalScale(20)} style={{ marginTop: verticalScale(24), marginBottom: verticalScale(12) }} />
            <View style={styles.boxContainer}>
                <SkeletonFrame width="100%" height={verticalScale(60)} />
            </View>

            {/* Required Certification */}
            <SkeletonFrame width={horizontalScale(180)} height={verticalScale(20)} style={{ marginTop: verticalScale(24), marginBottom: verticalScale(12) }} />
            <View style={styles.boxContainer}>
                <SkeletonFrame width={horizontalScale(200)} height={verticalScale(16)} style={{ marginBottom: verticalScale(12) }} />
                <SkeletonFrame width={horizontalScale(250)} height={verticalScale(16)} style={{ marginBottom: verticalScale(12) }} />
                <SkeletonFrame width={horizontalScale(180)} height={verticalScale(16)} />
            </View>

            {/* Required Contractor */}
            <View style={styles.contractorRow}>
                <SkeletonFrame width={horizontalScale(160)} height={verticalScale(20)} />
                <SkeletonFrame width={horizontalScale(44)} height={horizontalScale(44)} borderRadius={horizontalScale(8)} />
            </View>
        </ScrollView>
    );
};

export default JobMatchDetailsSkeleton;
