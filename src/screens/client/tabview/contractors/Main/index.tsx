import React, { useState, useEffect, useCallback, useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Toast } from '@utils/ToastManager';

import InputField from '@components/InputField';
import DropdownField from '@components/DropdownField';
import TopHeader from '@components/TopHeader';
import SkeletonFrame from '@components/SkeletonFrame';
import ContractorCard from '@components/ContractorCard';
import JobService from '@config/jobService';
import strings from '@constants/strings';
import styles from './styles';
import colors from '@styles/colors';
import { horizontalScale, verticalScale } from '@styles/mixins';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

const ContractorsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const toastRef = useRef<any>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [contractors, setContractors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [appliedRating, setAppliedRating] = useState(0);
  const [appliedCertifications, setAppliedCertifications] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<{ label: string, value: string }[]>([]);

  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const isFetchingRef = useRef(false);

  const toggleContractorSelection = (id: string) => {
    setSelectedContractors(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        setSelectAll(false);
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContractors([]);
      setSelectAll(false);
    } else {
      setSelectedContractors(contractors.map(c => c.contractorId || c._id || c.id));
      setSelectAll(true);
    }
  };

  const handleSendInvitation = () => {
    if (selectedContractors.length === 0 && !selectAll) {
      toastRef.current?.show({
        type: 'info',
        text1: strings.client.inviteContractors.selectionRequired,
        text2: strings.client.inviteContractors.selectAtLeastOne
      });
      return;
    }

    const payload: any = {
      selectAll
    };

    if (selectAll) {
      payload.search = debouncedSearch;
      payload.page = 1;
      payload.limit = 10;
      payload.certificationIds = appliedCertifications.length > 0 ? appliedCertifications.join(',') : undefined;
      payload.minRating = appliedRating > 0 ? appliedRating : undefined;
    } else {
      payload.contractorIds = selectedContractors;
    }

    const contractorIds = [...selectedContractors];

    if (selectedContractors.length === 1) {
      const selectedObj = contractors.find(c => (c.contractorId || c._id || c.id) === selectedContractors[0]);
      navigation.navigate('SelectJob', {
        invitationPayload: payload,
        contractor: selectedObj || selectedContractors[0],
        selectedContractorIds: contractorIds
      });
    } else {
      navigation.navigate('SelectJob', {
        invitationPayload: payload,
        selectedContractorIds: contractorIds
      });
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);



  const fetchContractors = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (isRefresh) {
        setRefreshing(true);
        setIsLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const certificationIds = appliedCertifications.length > 0
        ? appliedCertifications.join(',')
        : undefined;

      const response = await JobService.getContractorsForInvitation(
        pageNum,
        10,
        debouncedSearch.length >= 3 ? debouncedSearch : undefined,
        undefined, // jobData?.startDate (not available on this screen)
        undefined, // jobData?.endDate (not available on this screen)
        appliedRating > 0 ? appliedRating : undefined,
        certificationIds
      );

      if (response.success) {
        const newData = response.data?.data || [];
        if (isRefresh) {
          setContractors(newData);
          setPage(1);
        } else {
          setContractors(prev => [...prev, ...newData]);
          setPage(pageNum);
        }
        const pagination = response.data?.pagination;
        setHasNextPage(pagination?.hasNextPage || (newData.length === 10));
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
  }, [debouncedSearch, selectedRating, selectedCertifications, appliedRating, appliedCertifications]);


  useEffect(() => {
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

    fetchCertificates();
    fetchContractors(1, true);
  }, [debouncedSearch, appliedRating, appliedCertifications, fetchContractors]);

  const applyFilters = () => {
    setAppliedRating(selectedRating);
    setAppliedCertifications(selectedCertifications);
    setIsFilterVisible(false);
  };

  const handleRefresh = () => {
    fetchContractors(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLoading && hasNextPage && contractors.length > 0) {
      fetchContractors(page + 1);
    }
  };

  const handlePressContractor = (item: any) => {
    navigation.navigate('ContractorProfileDetail', { contractor: item, shouldShowButton: true });
  };

  const renderSkeleton = () => (
    <View style={{ gap: verticalScale(16) }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{ backgroundColor: colors.white, borderRadius: verticalScale(20), padding: horizontalScale(16), borderWidth: 1, borderColor: colors.statBorder }}>
          <View style={{ flexDirection: 'row', marginBottom: verticalScale(12) }}>
            <SkeletonFrame width={horizontalScale(60)} height={horizontalScale(60)} borderRadius={horizontalScale(30)} />
            <View style={{ marginLeft: horizontalScale(12), flex: 1, justifyContent: 'center' }}>
              <SkeletonFrame width="60%" height={verticalScale(16)} style={{ marginBottom: verticalScale(6) }} />
              <SkeletonFrame width="40%" height={verticalScale(12)} />
            </View>
          </View>
          <View style={{ gap: verticalScale(8) }}>
            <SkeletonFrame width="80%" height={verticalScale(12)} />
            <SkeletonFrame width="70%" height={verticalScale(12)} />
          </View>
        </View>
      ))}
    </View>
  );

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
              <View style={{ width: 50 }} />
              <AppText style={styles.filterTitle}>{strings.client.contractors.filterTitle}</AppText>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRating(0);
                  setSelectedCertifications([]);
                  setAppliedRating(0);
                  setAppliedCertifications([]);
                  setIsFilterVisible(false);
                }}
                activeOpacity={0.7}
                style={{ width: 50, alignItems: 'flex-end' }}
              >
                <AppText style={styles.clearText}>Clear</AppText>
              </TouchableOpacity>
            </View>


            <View style={styles.ratingFilterRow}>
              <AppText style={styles.filterSectionLabel}>{strings.client.contractors.minRatingLabel}</AppText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setSelectedRating(star === selectedRating ? 0 : star)}>
                    <Image
                      source={require('@assets/images/common/star.png')}
                      style={[styles.starIcon, { tintColor: star <= selectedRating ? '#FFC107' : colors.border }]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setSelectedRating(appliedRating);
                setSelectedCertifications(appliedCertifications);
                setIsFilterVisible(false);
              }}>
                <AppText style={styles.cancelButtonText}>{strings.common.cancel}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <AppText style={styles.applyButtonText}>{strings.client.contractors.apply}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
      <CustomToast ref={toastRef} />
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <TopHeader
        title={strings.client.contractors.screenTitle}
        hideBackButton
      />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <InputField
            placeholder={strings.client.contractors.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchInput}
            renderLeftIcon={() => (
              <Image source={require('@assets/images/common/searchIcon.png')} style={styles.searchIcon} />
            )}
            renderRightIcon={() => (
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(true)}
              >
                <Image
                  source={require('@assets/images/common/settingIcon.png')}
                  style={[styles.filterIcon, { tintColor: (appliedRating > 0 || appliedCertifications.length > 0) ? colors.primary : colors.gray }]}
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {contractors.length > 0 && (
          <View style={styles.selectionHeader}>
            <AppText style={styles.countText}>
              {strings.client.inviteContractors.contractorsCount(contractors.length)}
            </AppText>
            <TouchableOpacity style={styles.selectAllRow} onPress={handleSelectAll}>
              <Image
                source={selectAll
                  ? require('@assets/images/common/checkMark.png')
                  : require('@assets/images/common/unCheck.png')}
                style={styles.checkboxIcon}
              />
              <AppText style={styles.selectAllText}>{strings.client.inviteContractors.selectAll}</AppText>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && contractors.length === 0 ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={contractors}
            renderItem={({ item }) => (
              <ContractorCard
                item={item}
                onPress={handlePressContractor}
                showCheckbox
                isSelected={selectedContractors.includes(item.contractorId || item._id || item.id)}
                onToggle={toggleContractorSelection}
              />
            )}
            keyExtractor={(item) => item.contractorId || item._id || item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={
              <EmptyState
                imageSource={require('@assets/images/common/noData.png')}
                title={strings.client.contractors.noContractorsFound}
                description={strings.client.contractors.noContractorsDesc}
              />
            }
            ListFooterComponent={
              (loadingMore && contractors.length > 0) ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.invitationButton, (selectedContractors.length === 0 && !selectAll) && styles.disabledButton]}
          onPress={handleSendInvitation}
          disabled={selectedContractors.length === 0 && !selectAll}
          activeOpacity={0.8}
        >
          <AppText style={[styles.invitationButtonText, (selectedContractors.length === 0 && !selectAll) && styles.disabledButtonText]}>
            {selectedContractors.length > 0
              ? strings.client.inviteContractors.sendInvitation(selectedContractors.length)
              : 'Send Invitation'}
          </AppText>
        </TouchableOpacity>
      </View>

      {renderFilterModal()}
    </View>
  );
};

export default ContractorsScreen;
