import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import EmptyState from '@components/EmptyState';
import { getLocalDateTime } from '@utils/dateUtils';
import { useLocation } from '@hooks/useLocation';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import colors from '@styles/colors';
import strings from '@constants/strings';
import { devDebugger } from '@utils/devDebugger';

interface CompletedJobsListProps {
  searchQuery: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onDispute?: (job: any) => void;
  onRateClient?: (job: any) => void;
  onInitialEmpty?: (isEmpty: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  ratedJobIds?: string[];
  disputedJobIds?: string[];
}

const CompletedJobsList: React.FC<CompletedJobsListProps> = ({ searchQuery, startDate, endDate, onDispute, onRateClient, onInitialEmpty, onLoadingChange, ratedJobIds = [], disputedJobIds = [] }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const { location, loading: locationLoading } = useLocation();

  const debounceTimer = useRef<any>(null);
  const isFetchingRef = useRef(false);

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
        tab: 'completed',
        page: pageNum,
        limit: 10,
        search: searchQuery.trim().length >= 3 ? searchQuery.trim() : undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        lat: location?.latitude ?? undefined,
        lng: location?.longitude ?? undefined,
      });

      if (res.success && res.data) {
        const results = res.data.data || res.data.results || res.data || [];
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
      devDebugger.error('Error fetching completed jobs:', error);
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

  const mapItemToJobCardProps = (item: any) => {
    const jobId = item.id || item._id;
    return {
      ...item,
      jobTitle: item.title,
      companyName: item.organizationName,
      rating: item.rating?.toString() || '0',
      distance: item.distance ? `${item.distance}` : '-',
      dateRange: `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`,
      timeRange: `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`,
      jobRate: item.hourlyRate ? `${formatCurrency(item.hourlyRate)}` : '',
      proposedRate: item.proposedRate ? `${formatCurrency(item.proposedRate)}/h` : '',
      address: item.location || '',
      isAbleToDispute: item.isCancelledJob ? false : (disputedJobIds.includes(jobId) ? false : item.isAbleToDispute),
      isRatingClient: item.isCancelledJob ? true : (ratedJobIds.includes(jobId) ? true : item.isRatingClient),
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
          renderItem={({ item }) => <JobCard item={mapItemToJobCardProps(item)} tab="Completed" onPressAction={(action, job) => {
            if (action === 'dispute') onDispute?.(job);
            if (action === 'rateClient') onRateClient?.(job);
          }} />}
          ListEmptyComponent={
            <EmptyState
              imageSource={require('@assets/images/common/noData.png')}
              title={strings.auth.contractor.home.noCompletedJobs}
              description={strings.auth.contractor.home.noCompletedJobsDesc}
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
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 120, // Extra padding for the TabBar
  }
});

export default CompletedJobsList;
