import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import JobService from '@config/jobService';
import styles from './styles'; 
import colors from '@styles/colors';
import UpcomingJobCell from './UpcomingJobCell';
import SkeletonFrame from '@components/SkeletonFrame';
import { verticalScale } from '@styles/mixins';
import { Toast } from '@utils/ToastManager';

import { useNavigation } from '@react-navigation/native';
import ConfirmationPopup from '@components/ConfirmationPopup';
import strings from '@constants/strings';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

const UpcomingJobsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const response = await JobService.getUpcomingJobs(pageNum, 10);

      if (response.success) {
        const rawData = response.data?.data || [];
        const meta = response.data?.meta;

        const mappedJobs = rawData.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          title: item.jobTitle || item.title || 'N/A',
          hours: item.totalJobHours || item.hours || 0,
          filledPositions: item.positionsFilled !== undefined ? item.positionsFilled : (item.filledPositions || 0),
          totalPositions: item.contractorsRequired !== undefined ? item.contractorsRequired : (item.totalPositions || 0),
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Upcoming',
        }));

        if (isRefresh || pageNum === 1) {
          setJobs(mappedJobs);
          setPage(1);
        } else {
          setJobs(prev => {
            const existingIds = new Set(prev.map(j => j.id));
            const newJobs = mappedJobs.filter((j: any) => !existingIds.has(j.id));
            return [...prev, ...newJobs];
          });
          setPage(pageNum);
        }

        setHasNextPage(meta ? pageNum < meta.totalPage : rawData.length === 10);
      }
    } catch (error) {
      devDebugger.error('Error fetching upcoming jobs:', error);
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

  const handleDeletePress = (item: any) => {
    setSelectedJob(item);
    setModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedJob || isDeleting) return;
    
    const jobId = selectedJob._id || selectedJob.id;
    setIsDeleting(true);
    
    try {
      const res = await JobService.cancelJob(jobId);
      if (res.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Job cancelled successfully',
        });
        setModalVisible(false);
        // Update local state immediately for better UX
        setJobs(prev => prev.map(job => 
          (job._id === jobId || job.id === jobId) 
            ? { ...job, status: 'Cancelled' } 
            : job
        ));
        handleRefresh();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.message || 'Failed to cancel job',
        });
      }
    } catch (error) {
      devDebugger.error('Error cancelling job:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSkeleton = () => (
    <View style={{ gap: verticalScale(16) }}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.card}>
          <View style={{ padding: 16 }}>
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
          <View style={{ height: 1, backgroundColor: '#EAEAEA' }} />
          <View style={{ flexDirection: 'row', height: verticalScale(44) }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <SkeletonFrame width="60%" height={verticalScale(14)} />
            </View>
            <View style={{ width: 1, backgroundColor: '#EAEAEA' }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <SkeletonFrame width="60%" height={verticalScale(14)} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && jobs.length === 0 ? (
        <View style={styles.listContent}>
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => (
            <UpcomingJobCell 
              item={item} 
              onDelete={() => handleDeletePress(item)}
              onEdit={(jobItem) => navigation.navigate('CreateJob', { 
                draftData: jobItem,
                isEdit: true,
                onJobUpdated: (updatedJob: any) => {
                  if (updatedJob) {
                    setJobs(prev => prev.map(job => 
                      (job._id === updatedJob.id || job.id === updatedJob.id || job._id === updatedJob._id || job.id === updatedJob._id) 
                        ? { 
                            ...job, 
                            ...updatedJob,
                            title: updatedJob.title || updatedJob.jobTitle || job.title,
                            hours: updatedJob.totalJobHours || updatedJob.hours || job.hours,
                            totalPositions: updatedJob.contractorsRequired !== undefined ? updatedJob.contractorsRequired : job.totalPositions
                          } 
                        : job
                    ));
                  }
                }
              })}
            />
          )}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
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
              title={strings.client.jobs.noUpcomingJobsTitle}
              description={strings.client.jobs.noUpcomingJobsDesc}
            />
          }
        />
      )}

      <ConfirmationPopup
        visible={modalVisible}
        message={`Are you sure you want to cancel ${selectedJob?.jobTitle || selectedJob?.title || 'N/A'} job?`}
        confirmText="Yes"
        cancelText="No"
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isDeleting}
        isDestructive={true}
      />
    </View>
  );
};

export default UpcomingJobsScreen;
