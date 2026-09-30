import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  BackHandler
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { devDebugger } from '@utils/devDebugger';


import JobService from '@config/jobService';
import InputField from '@components/InputField';
import DropdownField from '@components/DropdownField';
import TopHeader from '@components/TopHeader';
import SkeletonFrame from '@components/SkeletonFrame';
import CustomButton from '@components/CustomButton';
import ContractorCard from '@components/ContractorCard';
import EmptyState from '@components/EmptyState';

import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import styles from '@screens/client/tabview/contractors/selectJob/styles';
import colors from '@styles/colors';
import strings from '@constants/strings';
import { horizontalScale, verticalScale } from '@styles/mixins';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';

// ─── TYPES ────────────────────────────────────────────────────────────

type InviteContractorsRouteProp = RouteProp<ClientAppStackParamList, 'InviteContractors'>;

interface Contractor {
  _id: string;
  contractorId: string;
  fullName: string;
  hourlyRate: number;
  profileImageUrl: string;
  rating: number;
  totalRatings: number;
  verificationStatus: string;
  workCategory: string;
  skills: string[];
}

interface CertificateItem {
  label: string;
  value: string;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────

const ContractorCardSkeleton = () => (
  <View style={{ backgroundColor: colors.white, borderRadius: verticalScale(20), padding: horizontalScale(16), marginBottom: verticalScale(16), borderWidth: 1, borderColor: colors.statBorder, opacity: 0.6 }}>
    <View style={{ flexDirection: 'row', marginBottom: verticalScale(12) }}>
      <SkeletonFrame width={horizontalScale(60)} height={horizontalScale(60)} borderRadius={horizontalScale(30)} />
      <View style={{ marginLeft: horizontalScale(12), flex: 1, justifyContent: 'center' }}>
        <SkeletonFrame width="60%" height={verticalScale(18)} style={{ marginBottom: 6 }} />
        <SkeletonFrame width="40%" height={verticalScale(14)} />
      </View>
    </View>
    <View style={{ gap: verticalScale(8) }}>
      <SkeletonFrame width="80%" height={verticalScale(14)} />
      <SkeletonFrame width="70%" height={verticalScale(14)} />
    </View>
  </View>
);

const ListFooter = ({ loading }: { loading: boolean }) => (
  loading ? (
    <View style={{ paddingVertical: verticalScale(20) }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : null
);

const ListEmpty = ({ isLoading }: { isLoading: boolean }) => (
  !isLoading ? (
    <EmptyState
      imageSource={require('@assets/images/common/noData.png')}
      title={strings.client.contractors.noContractorsFound}
      description={strings.client.contractors.noContractorsDesc}
    />
  ) : null
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────

const InviteContractorsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<InviteContractorsRouteProp>();
  const params = route.params as any;
  const jobId = params?.jobId || '';
  const jobData = useMemo(() => params?.jobData || {}, [params?.jobData]);

  // Disable iOS swipe back gesture
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  // Explicitly handle and block the Android Hardware Back Button
  useEffect(() => {
    const onHardwareBackPress = () => {
      return true; // stops the default back action
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => subscription.remove();
  }, []);

  // Intercept and block back actions (hardware back button/swipe back gesture)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Data State
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const toastRef = useRef<any>(null);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Filter State
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);

  // Ref to track loading state without triggering re-renders in useCallback
  const isFetchingRef = useRef(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // ─── EFFECTS ────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 3 || search.length === 0) {
        setDebouncedSearch(search);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCertificates();
    fetchContractors(jobId, 1, true);
  }, []);

  useEffect(() => {
    fetchContractors(jobId, 1, true);
  }, [debouncedSearch, selectedCertifications, selectedRating]);

  const fetchCertificates = async () => {
    try {
      const response = await JobService.getCertificates();
      if (response.success) {
        const data = response.data?.results || response.data || [];
        const certItems = data.map((c: any) => ({
          label: c.name || c.title || (typeof c === 'string' ? c : 'N/A'),
          value: c.id || c._id || (typeof c === 'string' ? c : 'N/A')
        }));
        setCertificates(certItems);
      }
    } catch (error) {
      devDebugger.error('Error fetching certificates:', error);
    }
  };

  const fetchContractors = useCallback(async (jobId: string, pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (isRefresh) {
        setRefreshing(true);
        setIsLoading(true);
        setTotalCount(0);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const certificationIds = selectedCertifications.length > 0
        ? selectedCertifications.join(',')
        : undefined;

      const response = await JobService.getContractorsForInvitation(
        pageNum,
        10,
        debouncedSearch.length >= 3 ? debouncedSearch : undefined,
        jobData?.startDate,
        jobData?.endDate,
        selectedRating > 0 ? selectedRating : undefined,
        certificationIds,
        jobId
      );

      if (response.success) {
        // Handle unflattened data (with pagination) or flattened data
        const newData = response.data?.results || response.data?.data || (Array.isArray(response.data) ? response.data : []);

        if (isRefresh) {
          setContractors(newData);
        } else {
          setContractors(prev => [...prev, ...newData]);

        }

        const pagination = response.data?.pagination;
        const totalPages = pagination?.totalPages || pagination?.total_pages || 1;
        const currentPage = pagination?.currentPage || pagination?.current_page || pageNum;

        setHasNextPage(currentPage < totalPages);
        setTotalCount(pagination?.totalCount || pagination?.total || (isRefresh ? newData.length : totalCount + newData.length));
      } else {
        toastRef.current?.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to fetch contractors'
        });
      }
    } catch (error: any) {
      devDebugger.error('Error fetching contractors:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, selectedRating, selectedCertifications, jobData?.startDate, jobData?.endDate]);

  // ─── HANDLERS ───────────────────────────────────────────────────────

  const handleRefresh = () => {
    fetchContractors(jobId, 1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLoading && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContractors(jobId, nextPage);
    }
  };

  const toggleSelectContractor = (id: string) => {
    setSelectedContractors(prev => {
      const isSelected = prev.includes(id);
      const newList = isSelected ? prev.filter(item => item !== id) : [...prev, id];

      if (isSelected) setSelectAll(false);
      else if (newList.length === (contractors.length > 0 ? contractors.length : -1)) setSelectAll(true);

      return newList;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContractors([]);
    } else {
      setSelectedContractors(contractors.map(c => c.contractorId));
    }
    setSelectAll(!selectAll);
  };

  const handleSendInvitations = async () => {
    if (!selectAll && selectedContractors.length === 0) {
      toastRef.current?.show({
        type: 'error',
        text2: 'Please select at least one contractor'
      });
      return;
    }

    try {
      setIsSending(true);

      const payload: any = {
        selectAll,
      };

      if (selectAll) {
        // If selectAll is true, send filter parameters only
        payload.search = debouncedSearch.length >= 3 ? debouncedSearch : undefined;
        payload.page = 1;
        payload.limit = 10;
        payload.certificationIds = selectedCertifications.length > 0 ? selectedCertifications.join(',') : undefined;
        payload.minRating = selectedRating > 0 ? selectedRating : undefined;
        payload.startDate = jobData?.startDate;
        payload.endDate = jobData?.endDate;
      } else {
        // If selectAll is false, send specific contractor IDs only
        payload.contractorIds = selectedContractors;
      }

      devDebugger.log("INVITE PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await JobService.sendInvitations(jobId, payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: response.message || 'Invitations sent successfully'
        });
        navigation.pop(3);
      } else {
        toastRef.current?.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to send invitations'
        });
      }
    } catch (error) {
      devDebugger.error('Error sending invitations:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleContractorPress = (item: any) => {
    navigation.navigate('ContractorProfileDetail', { contractor: item, jobId });
  };

  const handleOpenFilter = () => {
    setTempRating(selectedRating);
    setTempCertifications([...selectedCertifications]);
    setIsFilterVisible(true);
  };

  const handleApplyFilters = () => {
    setSelectedRating(tempRating);
    setSelectedCertifications([...tempCertifications]);
    setIsFilterVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      transparent
      visible={isFilterVisible}
      animationType="slide"
      onRequestClose={() => setIsFilterVisible(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setIsFilterVisible(false)}>
        <View style={styles.sheetContainer}>
          <View style={styles.handle} />
          <View style={styles.filterSheet}>
            <View style={styles.filterHeaderRow}>
              <AppText style={styles.filterTitle}>{strings.client.inviteContractors.filterBy}</AppText>
              <TouchableOpacity
                onPress={() => {
                  setTempRating(0);
                  setTempCertifications([]);
                }}
                activeOpacity={0.7}
                style={styles.clearButtonContainer}
              >
                <AppText style={styles.clearText}>{strings.client.inviteContractors.clear}</AppText>
              </TouchableOpacity>
            </View>

            <AppText style={styles.filterSectionLabel}>{strings.client.inviteContractors.certifications}</AppText>
            <DropdownField
              placeholder={strings.client.inviteContractors.selectCertifications}
              data={certificates}
              value={tempCertifications[0] || ''}
              onChange={(val) => {
                // Ensure val is always an array for tempCertifications
                setTempCertifications(Array.isArray(val) ? val : val ? [val] : []);
              }}
              isMultiSelect={false}
            />

            <View style={styles.ratingFilterRow}>
              <AppText style={styles.filterTitle}>{strings.client.inviteContractors.minimumRating}</AppText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setTempRating(prev => prev === star ? 0 : star)}>
                    <Image
                      source={require('@assets/images/common/star.png')}
                      style={[styles.starIcon, { width: 28, height: 28, tintColor: star <= tempRating ? '#FFC107' : colors.border }]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFilterVisible(false)}>
                <AppText style={styles.cancelButtonText}>{strings.client.inviteContractors.cancel}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <AppText style={styles.applyButtonText}>{strings.client.inviteContractors.apply}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  // ─── RENDER ─────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TopHeader
        title={strings.client.inviteContractors.screenTitle}
        onBack={() => navigation.pop(3)}
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <InputField
            placeholder={strings.client.inviteContractors.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchBarContainer}
            editable={!isLoading && (totalCount > 0 || search.length > 0)}
            renderLeftIcon={() => (
              <Image
                source={require('@assets/images/common/searchIcon.png')}
                style={styles.searchIconInside}
              />
            )}
            renderRightIcon={() => (
              <TouchableOpacity onPress={handleOpenFilter} disabled={false}>
                <Image
                  source={require('@assets/images/common/settingIcon.png')}
                  style={[styles.filterIconInside, { tintColor: (selectedRating > 0 || selectedCertifications.length > 0) ? colors.primary : colors.gray }]}
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Selection Header Row */}
        <View style={styles.selectionHeaderRow}>
          <AppText style={styles.totalCountText}>
            {strings.client.inviteContractors.contractorsCount(totalCount)}
          </AppText>
          <TouchableOpacity
            style={[styles.selectAllRow, (totalCount === 0 || isLoading) && { opacity: 0.5 }]}
            onPress={handleSelectAll}
            activeOpacity={0.8}
            disabled={totalCount === 0 || isLoading}
          >
            <View style={styles.checkbox}>
              <Image
                source={selectAll
                  ? require('@assets/images/common/checkMark.png')
                  : require('@assets/images/common/unCheck.png')}
                style={styles.checkboxImage}
              />
            </View>
            <AppText style={styles.selectAllText}>{strings.client.inviteContractors.selectAll}</AppText>
          </TouchableOpacity>
        </View>

        {isLoading && page === 1 ? (
          <FlatList
            data={[1, 2, 3]}
            renderItem={() => <ContractorCardSkeleton />}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={contractors}
            renderItem={({ item }) => (
              <ContractorCard
                item={item}
                isSelected={selectedContractors.includes(item.contractorId)}
                onToggle={toggleSelectContractor}
                onPress={handleContractorPress}
                showCheckbox={true}
              />
            )}
            keyExtractor={(item) => item.contractorId || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listFooter}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={<ListFooter loading={loadingMore} />}
            ListEmptyComponent={<ListEmpty isLoading={isLoading} />}
          />
        )}

        {renderFilterModal()}
      </View>

      <View style={styles.jobFooter}>
        <CustomButton
          title={strings.client.inviteContractors.sendInvitation(selectedContractors.length)}
          onPress={handleSendInvitations}
          loading={isSending}
          disabled={selectedContractors.length === 0}
        />
      </View>
      <CustomToast ref={toastRef} />
    </View>
  );
};

export default InviteContractorsScreen;
