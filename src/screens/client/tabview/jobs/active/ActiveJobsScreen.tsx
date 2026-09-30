import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import JobService from '@config/jobService';
import styles from './styles';
import strings from '@constants/strings';
import colors from '@styles/colors';
import JobCard from '../common/JobCard/JobCard';
import { JobStatus } from '@constants/enums';
import SkeletonFrame from '@components/SkeletonFrame';
import { verticalScale, horizontalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

const ActiveJobsScreen: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const isFetchingRef = useRef(false);

  const fetchJobs = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await JobService.getActiveJobs(pageNum, 10);

      if (response.success) {
        const rawData = response.data?.results?.data || response.data?.data || [];
        const meta = response.data?.results?.pagination || response.data?.meta;

        const mappedJobs = rawData.map((item: any) => ({
          id: item._id || item.id,
          title: item.jobTitle || item.title || 'N/A',
          hours: item.totalJobHours || item.hours || 0,
          filledPositions: item.positionsFilled !== undefined ? item.positionsFilled : (item.filledPositions || 0),
          totalPositions: item.contractorsRequired !== undefined ? item.contractorsRequired : (item.totalPositions || 0),
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active',
          ...item // Keep original data for details screen
        }));

        if (isRefresh) {
          setJobs(mappedJobs);
          setPage(1);
        } else {
          setJobs(prev => [...prev, ...mappedJobs]);
          setPage(pageNum);
        }

        setHasNextPage(meta ? pageNum < meta.totalPage : rawData.length === 10);
      }
    } catch (error) {
      devDebugger.error('Error fetching active jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleRefresh = () => {
    fetchJobs(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLoading && hasNextPage && jobs.length > 0) {
      fetchJobs(page + 1);
    }
  };

  const renderSkeleton = () => (
    <View style={{ gap: verticalScale(16) }}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) }}>
            <SkeletonFrame width="50%" height={verticalScale(18)} />
            <View style={{ width: '20%', alignItems: 'flex-end' }}>
              <SkeletonFrame width="100%" height={verticalScale(18)} borderRadius={10} />
            </View>
          </View>
          <View style={{ gap: verticalScale(10) }}>
            <SkeletonFrame width="70%" height={verticalScale(14)} />
            <SkeletonFrame width="60%" height={verticalScale(14)} />
            <SkeletonFrame width="40%" height={verticalScale(14)} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {isLoading && jobs.length === 0 ? (
          <View style={styles.listContent}>
            {renderSkeleton()}
          </View>
        ) : (
          <FlatList
            data={jobs}
            renderItem={({ item }) => <JobCard item={item} jobStatus={JobStatus.ACTIVE} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListFooterComponent={
              (loadingMore && jobs.length > 0) ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : <View style={{ height: 20 }} />
            }
            ListEmptyComponent={
              <EmptyState
                imageSource={require('@assets/images/common/noData.png')}
                title={strings.client.jobs.noActiveJobsTitle}
                description={strings.client.jobs.noActiveJobsDesc}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default ActiveJobsScreen;
