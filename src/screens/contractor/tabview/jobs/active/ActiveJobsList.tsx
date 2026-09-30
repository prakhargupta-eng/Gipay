import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import JobCard from '../components/JobCard';
import { useLocation } from '@hooks/useLocation';
import JobCardSkeleton from '../components/JobCardSkeleton';
import ClockInOutPopup from '../components/ClockInOutPopup';
import { getLocalDateTime } from '@utils/dateUtils';
import EmptyState from '@components/EmptyState';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import { checkClockInEligibility } from '@utils/dateUtils';
import strings from '@constants/strings';
import colors from '@styles/colors';
import { devDebugger } from '@utils/devDebugger';
import { useUserStore } from '@store/useUserStore';

interface ActiveJobsListProps {
  searchQuery: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onDispute?: (job: any) => void;
  onInitialEmpty?: (isEmpty: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  ratedJobIds?: string[];
  disputedJobIds?: string[];
}

const ActiveJobsList: React.FC<ActiveJobsListProps> = ({ searchQuery, startDate, endDate, onDispute, onInitialEmpty, onLoadingChange, ratedJobIds = [], disputedJobIds = [] }) => {
  const storeDisputeLeaveJobIds = useUserStore(state => state.disputeLeaveJobIds);
  const storeDisputedJobIds = useUserStore(state => state.disputedJobIds);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [clockedInJobIds, setClockedInJobIds] = useState<string[]>([]);
  const [clockedInJobsTimeMap, setClockedInJobsTimeMap] = useState<Record<string, string>>({});
  const [clockedOutJobIds, setClockedOutJobIds] = useState<string[]>([]);
  const { location, loading: locationLoading, verifyJobGeofence } = useLocation();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const debounceTimer = useRef<any>(null);
  const isFetchingRef = useRef(false);
  const isActionRunning = useRef(false);

  const fetchJobs = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      onLoadingChange?.(true);
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum > 1) {
        setIsMoreLoading(true);
      } else {
        setLoading(true);
      }

      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;

      const res = await JobService.getContractorMyJobs({
        tab: 'active',
        page: pageNum,
        limit: 10,
        search: searchQuery.trim().length >= 3 ? searchQuery.trim() : undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        lat: location?.latitude ?? undefined,
        lng: location?.longitude ?? undefined,
      });

      if (res.success && res.data) {
        const results = res.data.data || res.data || [];
        const pagination = res.data.pagination;

        if (isRefresh || pageNum === 1) {
          setJobs(results);
          setPage(1);

          // If no search or filters applied, and we got 0 results on page 1, set initial empty state
          if (!searchQuery.trim() && !formattedStartDate && !formattedEndDate) {
            onInitialEmpty?.(results.length === 0);
          }
        } else {
          setJobs(prev => [...prev, ...results]);
          setPage(pageNum);
        }

        if (pagination && pagination.page !== undefined && pagination.pages !== undefined) {
          setHasMore(pagination.page < pagination.pages);
        } else {
          setHasMore(results.length === 10);
        }
      } else {
        Toast.show({ type: 'error', text2: res.message || 'Failed to fetch jobs' });
      }
    } catch (error: any) {
      devDebugger.error('Error fetching active jobs:', error);
      Toast.show({ type: 'error', text2: error.message || 'An unexpected error occurred' });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsMoreLoading(false);
      isFetchingRef.current = false;
      onLoadingChange?.(false);
    }
  }, [searchQuery, startDate, endDate, location?.latitude, location?.longitude]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // If they typed 1 or 2 characters, don't trigger API call, wait for them to finish typing
    if (searchQuery.trim().length > 0 && searchQuery.trim().length < 3) {
      return;
    }

    const delay = searchQuery.trim().length >= 3 ? 800 : 100;

    // Fetch jobs immediately without waiting for location
    if (locationLoading) return;


    debounceTimer.current = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(false);
      fetchJobs(1);
    }, delay);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, startDate, endDate, locationLoading, location?.latitude, location?.longitude]);

  // Filter and match active jobs when user raised dispute with leave the job option
  useEffect(() => {
    if (storeDisputeLeaveJobIds && storeDisputeLeaveJobIds.length > 0) {
      setJobs(prevJobs =>
        prevJobs.map(job => {
          const jId = job.id || job._id;
          if (storeDisputeLeaveJobIds.includes(jId)) {
            return {
              ...job,
              isClockedIn: false,
              isDisputeLeave: true,
              clockedOut: true,
              isClockedOut: true,
              isAbleToDispute: false,
            };
          }
          return job;
        })
      );
      setClockedOutJobIds(prev => [...new Set([...prev, ...storeDisputeLeaveJobIds])]);
      setClockedInJobIds(prev => prev.filter(id => !storeDisputeLeaveJobIds.includes(id)));
    }
  }, [storeDisputeLeaveJobIds]);

  const handleAction = async (actionType: string, job: any) => {
    if (isActionRunning.current) return;
    isActionRunning.current = true;
    try {
      if (actionType === 'clockIn' || actionType === 'clockOut') {
        if (actionType === 'clockIn') {
          if (job.isClockedOut) {
            Toast.show({ type: 'info', text2: strings.auth.contractor.home.clockInOutPopup.jobCompleted });
            return;
          }
          const hasActiveClockIn = jobs.some(j => {
            const jId = j.id || j._id;
            let isClockedIn = j.isClockedIn || j.manualClockInByClient;
            if (clockedInJobIds.includes(jId)) isClockedIn = true;
            if (clockedOutJobIds.includes(jId)) isClockedIn = false;
            return isClockedIn;
          });

          if (hasActiveClockIn) {
            Toast.show({ type: 'error', text2: strings.auth.contractor.home.clockInOutPopup.activeJobRunning });
            return;
          }

          const errorMsg = checkClockInEligibility(job.startDate, job.endDate, actionType);
          if (errorMsg) {
            Toast.show({ type: 'info', text2: errorMsg });
            return;
          }
        }

        await verifyJobGeofence(job, actionType as 'clockIn' | 'clockOut', (jobWithLoc) => {
          setSelectedJob(jobWithLoc);
        });
      } else if (actionType === 'dispute') {
        onDispute?.(job);
      }
    } finally {
      isActionRunning.current = false;
    }
  };

  const mapItemToJobCardProps = (item: any) => {
    const jobId = item.id || item._id;
    let isClockedIn = item.isClockedIn || item.manualClockInByClient;
    let clockInTime = item.clockInTime;

    if (clockedInJobIds.includes(jobId)) {
      isClockedIn = true;
      if (clockedInJobsTimeMap[jobId]) {
        clockInTime = clockedInJobsTimeMap[jobId];
      }
    }

    if (clockedOutJobIds.includes(jobId)) isClockedIn = false;

    // Single boolean for dispute leave option
    const isDisputeLeave = Boolean(
      item?.isDisputeLeave ||
      storeDisputeLeaveJobIds.includes(jobId)
    );

    if (isDisputeLeave) {
      isClockedIn = false;
    }

    const isJobDisputed = Boolean(
      isDisputeLeave ||
      storeDisputedJobIds.includes(jobId) ||
      disputedJobIds.includes(jobId)
    );

    return {
      ...item,
      jobTitle: item.title,
      companyName: item.organizationName,
      rating: item.rating?.toString() || '0',
      distance: item.distance ? `${item.distance}` : '-',
      dateRange: `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`,
      timeRange: `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`,
      jobRate: item.hourlyRate ? `${item.hourlyRate}` : '',
      proposedRate: item.proposedRate ? `${item.proposedRate}` : '',
      address: item.location || '',
      isAbleToDispute: isJobDisputed ? false : item.isAbleToDispute,
      isRatingClient: ratedJobIds.includes(jobId) ? true : item.isRatingClient,
      isClockedIn,
      clockInTime,
      isDisputeLeave,
    };
  };

  const renderSkeleton = () => (
    <View>
      {[1, 2, 3].map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </View>
  );

  return (
    <>
      {loading && !refreshing ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => <JobCard item={mapItemToJobCardProps(item)} tab="Active" onPressAction={handleAction} />}
          ListEmptyComponent={
            <EmptyState
              imageSource={require('@assets/images/common/noData.png')}
              title={strings.auth.contractor.home.noActiveJobs}
              description={strings.auth.contractor.home.noActiveJobsDesc}
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchJobs(1, true)} colors={[colors.primary]} />}
          onEndReached={() => {
            if (!loading && !isMoreLoading && hasMore) {
              fetchJobs(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            isMoreLoading ? <View style={{ paddingVertical: 20 }}><ActivityIndicator color={colors.primary} /></View> : null
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      <ClockInOutPopup
        visible={!!selectedJob}
        job={selectedJob}
        onClose={(action, clockInTime) => {
          if (action === 'clockIn' && selectedJob) {
            const targetJobId = selectedJob.id || selectedJob._id;

            // 1. Update the jobs model directly (optimistic update for pagination)
            setJobs(prevJobs => prevJobs.map(job => {
              const jId = job.id || job._id;
              if (jId === targetJobId) {
                return { ...job, isClockedIn: true, clockedOut: false, clockInTime: clockInTime || job.clockInTime };
              }
              return job;
            }));

            // 2. Keep the tracker arrays for legacy override logic
            setClockedInJobIds(prev => [...prev, targetJobId]);
            if (clockInTime) {
              setClockedInJobsTimeMap(prev => ({ ...prev, [targetJobId]: clockInTime }));
            }
          } else if (action === 'clockOut' && selectedJob) {
            const targetJobId = selectedJob.id || selectedJob._id;

            // 1. Update the jobs model directly
            setJobs(prevJobs => prevJobs.map(job => {
              const jId = job.id || job._id;
              if (jId === targetJobId) {
                return {
                  ...job,
                  isClockedIn: false,
                  clockedOut: true,
                  isClockedOut: true,
                  status: 'pendingApproval',
                  clockOutTime: new Date().toISOString()
                };
              }
              return job;
            }));

            // 2. Keep the tracker arrays for legacy override logic
            setClockedOutJobIds(prev => [...prev, targetJobId]);
          }
          setSelectedJob(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 120, // Extra padding for the TabBar
  }
});

export default ActiveJobsList;
