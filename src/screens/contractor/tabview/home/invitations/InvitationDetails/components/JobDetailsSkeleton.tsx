import React from 'react';
import { View, Dimensions } from 'react-native';
import SkeletonFrame from '@components/SkeletonFrame';
import styles from '../styles';
import { horizontalScale, verticalScale } from '@styles/mixins';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH - horizontalScale(40);

const JobDetailsSkeleton = () => {
    return (
        <View style={styles.skeletonContainer}>
            {/* Header Skeleton */}
            <View style={styles.skeletonHeader}>
                <SkeletonFrame 
                    width={horizontalScale(80)} 
                    height={horizontalScale(80)} 
                    borderRadius={horizontalScale(40)} 
                />
                <View style={styles.skeletonHeaderText}>
                    <SkeletonFrame 
                        width={CONTENT_WIDTH * 0.7} 
                        height={verticalScale(20)} 
                        style={styles.skeletonLineSpacing} 
                    />
                    <SkeletonFrame 
                        width={CONTENT_WIDTH * 0.5} 
                        height={verticalScale(16)} 
                        style={styles.skeletonLineSpacing}
                    />
                    <SkeletonFrame 
                        width={CONTENT_WIDTH * 0.3} 
                        height={verticalScale(14)} 
                    />
                </View>
            </View>
            
            {/* Info Grid Skeleton */}
            <SkeletonFrame 
                width={CONTENT_WIDTH} 
                height={verticalScale(120)} 
                borderRadius={12} 
                style={styles.skeletonSpacing} 
            />
            
            {/* About Job Skeleton */}
            <SkeletonFrame 
                width={CONTENT_WIDTH * 0.4} 
                height={verticalScale(20)} 
                style={styles.skeletonSmallSpacing} 
            />
            <SkeletonFrame 
                width={CONTENT_WIDTH} 
                height={verticalScale(80)} 
                borderRadius={12} 
                style={styles.skeletonSpacing} 
            />
            
            {/* Certifications Skeleton */}
            <SkeletonFrame 
                width={CONTENT_WIDTH * 0.5} 
                height={verticalScale(20)} 
                style={styles.skeletonSmallSpacing} 
            />
            <View style={styles.skeletonSpacing}>
                {[1, 2, 3].map((i) => (
                    <SkeletonFrame 
                        key={i} 
                        width={CONTENT_WIDTH * 0.9} 
                        height={verticalScale(14)} 
                        style={{ marginBottom: 12 }} 
                    />
                ))}
            </View>
            
            {/* Contractor Rows Skeleton */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                <SkeletonFrame width={CONTENT_WIDTH * 0.5} height={verticalScale(16)} />
                <SkeletonFrame width={horizontalScale(48)} height={verticalScale(36)} borderRadius={10} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                <SkeletonFrame width={CONTENT_WIDTH * 0.5} height={verticalScale(16)} />
                <SkeletonFrame width={horizontalScale(48)} height={verticalScale(36)} borderRadius={10} />
            </View>

            {/* Footer Buttons Skeleton */}
            <View style={{ flexDirection: 'row', marginTop: 'auto', paddingBottom: 20 }}>
                <SkeletonFrame 
                    width={CONTENT_WIDTH * 0.48} 
                    height={verticalScale(56)} 
                    borderRadius={12} 
                    style={{ marginRight: CONTENT_WIDTH * 0.04 }} 
                />
                <SkeletonFrame 
                    width={CONTENT_WIDTH * 0.48} 
                    height={verticalScale(56)} 
                    borderRadius={12} 
                />
            </View>
        </View>
    );
};

export default JobDetailsSkeleton;
