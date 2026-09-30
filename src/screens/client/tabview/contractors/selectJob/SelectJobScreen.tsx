import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@components/CustomButton';
import InputField from '@components/InputField';
import TopHeader from '@components/TopHeader';
import SkeletonFrame from '@components/SkeletonFrame';
import JobService from '@config/jobService';
import { getLocalDateTime } from '@utils/dateUtils';
import { Toast } from '@utils/ToastManager';
import strings from '@constants/strings';
import { useUserStore } from '@store/useUserStore';

import styles from './styles';
import colors from '@styles/colors';
import { horizontalScale, verticalScale } from '@styles/mixins';
import { utils } from '@react-native-firebase/app';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

const SelectJobScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { contractor, invitationPayload, selectedContractorIds } = route.params || {};

  // Resolve contractor ID from various possible structures
  const contractorId = (typeof contractor === 'string' ? contractor :
    (contractor?.contractorId || contractor?._id || contractor?.id || contractor?.userId))
    || (selectedContractorIds && selectedContractorIds.length > 0 ? selectedContractorIds[0] : null)
    || (invitationPayload?.contractorIds && invitationPayload.contractorIds.length > 0 ? invitationPayload.contractorIds[0] : null);

  const contractorIds = selectedContractorIds || invitationPayload?.contractorIds || (contractorId ? [contractorId] : []);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const isMultipleContractors = invitationPayload?.selectAll || contractorIds.length > 1;

  const isFetchingRef = useRef(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchJobs = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (isRefresh) {
        setRefreshing(true);
        setIsLoading(true);
        setPage(1);
        setHasNextPage(true);
      } else {
        setLoadingMore(true);
      }
      const payload: any = invitationPayload ? { ...invitationPayload } : {
        selectAll: false,
        contractorIds: [contractorId]
      };

      // The 'search' in this API refers to job search (title/location)
      if (debouncedSearch.length >= 1) {
        payload.search = debouncedSearch;
      }

      const response = await JobService.getInvitationEligibleJobs(
        payload,
        pageNum,
        10
      );

      if (response.success) {
        const newData = response.data?.data || [];
        const meta = response.data?.meta;

        if (isRefresh) {
          setJobs(newData);
        } else {
          setJobs(prev => [...prev, ...newData]);
        }

        setHasNextPage(meta ? pageNum < meta.totalPage : newData.length === 10);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      devDebugger.error('Error fetching jobs:', error);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, contractorId, invitationPayload]);

  useEffect(() => {
    fetchJobs(1, true);
  }, [debouncedSearch, fetchJobs]);

  const handleRefresh = () => {
    fetchJobs(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLoading && hasNextPage && jobs.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage);
    }
  };

  const handleSelectAll = () => {
    if (isMultipleContractors) return;

    const next = !selectAll;
    setSelectAll(next);
    if (next) {
      setSelectedJobs(jobs.map(j => j._id || j.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setIsInviting(true);

      const contractorsSelectAll = invitationPayload?.selectAll || false;

      let payload: any = {};

      if (contractorsSelectAll && selectAll) {
        // Case: ALL matching contractors to ALL matching jobs
        payload = {
          ...invitationPayload,
          selectAll: true,
        };
        delete payload.contractorIds;
        delete payload.jobIds;
      } else if (contractorsSelectAll) {
        // Case: ALL matching contractors to SPECIFIC jobs
        payload = {
          ...invitationPayload,
          selectAll: true,
          jobIds: selectedJobs,
        };
        delete payload.contractorIds;
      } else if (selectAll) {
        // Case: SPECIFIC contractor(s) to ALL qualified jobs
        payload = {
          selectAll: true,
          contractorIds: contractorIds,
        };
        if (debouncedSearch.trim().length > 0) {
          payload.search = debouncedSearch;
        }
      } else {
        // Case: SPECIFIC contractor(s) to SPECIFIC job(s)
        payload = {
          selectAll: false,
          contractorIds: contractorIds,
          jobIds: selectedJobs,
        };
      }

      if (isMultipleContractors) {
        const summaryPayload: any = {
          jobId: selectedJobs[0],
          selectAll: contractorsSelectAll,
          search: invitationPayload?.search || "",
          page: invitationPayload?.page || 1,
          limit: invitationPayload?.limit || 10,
        };

        if (!contractorsSelectAll && contractorIds && contractorIds.length > 0) {
          summaryPayload.contractorIds = contractorIds;
        }

        // Also pass the job details for the first selected job so ReviewInvitation can show the JobCard
        const selectedJobDetails = jobs.find(j => j._id === selectedJobs[0] || j.id === selectedJobs[0]);

        navigation.navigate('ReviewInvitation', { payload, summaryPayload, job: selectedJobDetails });
      } else {
        const response = await JobService.inviteContractorToJobs(payload);
        if (response.success) {
          Toast.show({
            type: 'success',
            text1: 'Invitation Sent',
            text2: response.message || 'Successfully sent invitation.'
          });
          useUserStore.getState().setClientTabIndex(1);
          navigation.navigate('ClientTabBar');
        } else {
          Toast.show({ type: 'error', text2: response.message || 'Failed to send invitation' });
        }
      }

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: error.message || 'Something went wrong'
      });
    } finally {
      setIsInviting(false);
    }
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobs((prev) => {
      if (isMultipleContractors) {
        // If multiple contractors, only one job can be selected
        return [id];
      }

      const isSelected = prev.includes(id);
      if (isSelected) {
        setSelectAll(false);
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const JobCard = ({ item }: { item: any }) => {
    const isSelected = selectedJobs.includes(item._id || item.id);
    const title = item.jobTitle || item.title || 'N/A';
    const pay = item.hourlyRate || item.pay || 'N/A';
    const company = item.organizationName || item.company || 'Tech Corporate';
    const dateRange = (item.startDate || item.dateRange) && item.endDate
      ? `${getLocalDateTime(item.startDate || item.dateRange).date} - ${getLocalDateTime(item.endDate).date}`
      : (item.dateRange || 'N/A');

    return (
      <TouchableOpacity
        style={[styles.jobCard]}
        activeOpacity={0.8}
        onPress={() => toggleJobSelection(item._id || item.id)}
      >
        <View style={styles.jobCardMain}>
          <View style={styles.jobCardContent}>
            <AppText style={styles.jobTitle} numberOfLines={1}>{title}</AppText>
            <AppText style={styles.jobCompany} numberOfLines={1}>{company}</AppText>
            <View style={styles.jobDateRow}>
              <Image source={require('@assets/images/common/calanderGray.png')} style={styles.jobDateIcon} />
              <AppText style={styles.jobDateText}>{dateRange}  |  {typeof pay === 'number' ? `${formatCurrency(pay)}/h` : pay}</AppText>
            </View>
          </View>
          <View style={styles.checkboxContainer}>
            <Image
              source={isSelected
                ? require('@assets/images/common/checkMark.png')
                : require('@assets/images/common/unCheck.png')}
              style={styles.checkboxImage}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={{ gap: verticalScale(16) }}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.jobCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) }}>
            <SkeletonFrame width="50%" height={verticalScale(18)} />
            <SkeletonFrame width="20%" height={verticalScale(18)} />
          </View>
          <SkeletonFrame width="40%" height={verticalScale(14)} style={{ marginBottom: verticalScale(12) }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: horizontalScale(8) }}>
            <SkeletonFrame width={horizontalScale(16)} height={horizontalScale(16)} borderRadius={horizontalScale(4)} />
            <SkeletonFrame width="60%" height={verticalScale(14)} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopHeader title="Select a Job" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {!(isLoading && jobs.length === 0) && (
          <View style={[styles.searchContainer, { zIndex: 10 }]}>
            <InputField
              placeholder="Search Jobs"
              value={search}
              onChangeText={setSearch}
              containerStyle={styles.searchBarContainer}
              onFocus={() => { devDebugger.log('hello'); }}
              renderLeftIcon={() => (
                <Image
                  source={require('@assets/images/common/searchIcon.png')}
                  style={styles.searchIconInside}
                />
              )}
            />
          </View>
        )}

        {jobs.length > 0 && (
          <View style={[styles.selectionHeaderRow, isMultipleContractors && { marginTop: verticalScale(40) }]}>
            {!isMultipleContractors && (
              <TouchableOpacity
                style={[styles.selectAllRow, jobs.length === 0 && { opacity: 0.5 }]}
                onPress={handleSelectAll}
                activeOpacity={0.8}
                disabled={jobs.length === 0}
              >
                <View style={styles.checkbox}>
                  <Image
                    source={(selectAll || (jobs.length > 0 && selectedJobs.length === jobs.length))
                      ? require('@assets/images/common/checkMark.png')
                      : require('@assets/images/common/unCheck.png')}
                    style={styles.checkboxImage}
                  />
                </View>
                <AppText style={styles.selectAllText}>Select All</AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLoading && jobs.length === 0 ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={jobs}
            renderItem={JobCard}
            keyExtractor={(item) => item._id || item.id}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: jobs.length === 0 ? 20 : 0 }}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
            }
            ListFooterComponent={
              (loadingMore && jobs.length > 0) ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : null
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <EmptyState
                  imageSource={require('@assets/images/common/noData.png')}
                  title={strings.client.contractors.noJobsFound}
                  description={strings.client.contractors.noJobsDesc}
                />
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.jobFooter}>
        <CustomButton
          title="Send Invitation"
          onPress={handleSendInvitation}
          loading={isInviting}
          disabled={(selectedJobs.length === 0 && !selectAll) || (selectAll && jobs.length === 0) || isInviting}
        />
      </View>
    </View>
  );
};

export default SelectJobScreen;
