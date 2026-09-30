import React from 'react';
import Skeleton from 'react-native-reanimated-skeleton';

/**
 * SkeletonFrame component rewritten to use react-native-reanimated-skeleton.
 * Retains compatibility with all 400+ instances in the application.
 */
const SkeletonFrame = ({ width, height, borderRadius = 8, style }: {
  width: any;
  height: any;
  borderRadius?: number;
  style?: any;
}) => {
  return (
    <Skeleton
      containerStyle={[{ width, height, borderRadius }, style]}
      isLoading={true}
      layout={[{ key: 'shimmer-frame', width, height, borderRadius }]}
    />
  );
};

export { default as Skeleton } from 'react-native-reanimated-skeleton';
export default SkeletonFrame;
