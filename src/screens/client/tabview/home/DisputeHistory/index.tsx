import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Toast } from '@utils/ToastManager';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import { devDebugger } from '@utils/devDebugger';

import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import EmptyState from '@components/EmptyState';
import strings from '@constants/strings';
import colors from '@styles/colors';

import { getLocalDateTime } from '@utils/dateUtils';
import DisputeCard from './components/DisputeCard';
import DisputeCardSkeleton from './components/DisputeCardSkeleton';
import styles from './styles';
import DisputeService, { Dispute } from '@config/disputeService';
import FilterModal from '@components/FilterModal';
import EvidenceSheetModal from '@components/EvidenceSheetModal';

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'DisputeHistory'>;

const CATEGORIES = [
    strings.client.disputes.all,
    strings.client.disputes.pending,
    strings.client.disputes.settled
];

const DisputeHistory = () => {
    const navigation = useNavigation<NavigationProp>();
    const [selectedType, setSelectedType] = useState(strings.client.disputes.byClient);
    const [selectedCategory, setSelectedCategory] = useState(strings.client.disputes.all);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [isInitialEmpty, setIsInitialEmpty] = useState(false);
    
    // For Evidence Sheet Modal
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [sheetEvidences, setSheetEvidences] = useState<any[]>([]);
    const [sheetJobTitle, setSheetJobTitle] = useState('');

    const debounceTimer = useRef<any>(null);
    const isFetchingRef = useRef(false);
    const searchRef = useRef(searchQuery);
    const startDateRef = useRef(startDate);
    const endDateRef = useRef(endDate);
    const typeRef = useRef(selectedType);

    useEffect(() => {
        searchRef.current = searchQuery;
    }, [searchQuery]);
    useEffect(() => {
        startDateRef.current = startDate;
    }, [startDate]);
    useEffect(() => {
        endDateRef.current = endDate;
    }, [endDate]);
    useEffect(() => {
        typeRef.current = selectedType;
    }, [selectedType]);

    const getContractorName = (item: Dispute) => {
        const byClient = selectedType === strings.client.disputes.byClient;
        if (byClient) {
            return item.otherParty?.fullName || item.initiatedFor?.fullName || '';
        } else {
            return item.initiatedBy?.fullName || item.otherParty?.fullName || '';
        }
    };

    /**
     * Fetches the list of disputes from the API.
     */
    const fetchDisputes = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            if (isRefresh) {
                setRefreshing(true);
            } else if (pageNum > 1) {
                setIsMoreLoading(true);
            } else {
                setLoading(true);
            }

            const currentTab: 'by' | 'for' = typeRef.current === strings.client.disputes.byClient ? 'by' : 'for';
            
            // Build query params
            const params: any = {
                tab: currentTab,
                page: pageNum,
                limit: 10,
            };

            const searchVal = searchRef.current.trim();
            if (searchVal.length >= 3) {
                params.search = searchVal;
            }

            if (startDateRef.current) {
                params.fromDate = startDateRef.current.toISOString().split('T')[0];
            }
            if (endDateRef.current) {
                params.toDate = endDateRef.current.toISOString().split('T')[0];
            }

            const res = await DisputeService.getClientDisputes(params);

            if (res.success && res.data) {
                const results = res.data.data || [];
                const pagination = res.data.pagination;

                // Check if overall list is empty on initial load of the tab (no search and no date filter)
                const isQueryEmpty = !searchVal && !startDateRef.current && !endDateRef.current;
                if (pageNum === 1 && isQueryEmpty) {
                    setIsInitialEmpty(results.length === 0);
                }

                if (isRefresh || pageNum === 1) {
                    setDisputes(results);
                    setPage(1);
                } else {
                    setDisputes(prev => [...prev, ...results]);
                    setPage(pageNum);
                }

                // Check if there is a next page
                if (pagination && pagination.page !== undefined && pagination.pages !== undefined) {
                    setHasMore(pagination.page < pagination.pages);
                } else {
                    setHasMore(results.length === 10);
                }
            } else {
                Toast.show({
                    type: 'error',
                    text2: res.message || 'Failed to fetch disputes'
                });
            }
        } catch (error: any) {
            devDebugger.error('Error fetching client disputes:', error);
            Toast.show({
                type: 'error',
                text2: error.message || 'An unexpected error occurred'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        // If the user has typed something but less than 3 chars, wait until they finish or type 3+
        if (searchQuery.length > 0 && searchQuery.length < 3) {
            return;
        }

        // Debounce tab changes, date changes, and search queries
        const delay = (searchQuery.length >= 3) ? 800 : 500;

        // Immediately set loading/pagination states to initial values
        setLoading(true);
        setPage(1);
        setHasMore(false);

        debounceTimer.current = setTimeout(() => {
            fetchDisputes(1);
        }, delay);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [selectedType, searchQuery, startDate, endDate]);

    const renderSkeleton = () => (
        <View style={{ padding: 20 }}>
            {[1, 2, 3].map((_, i) => (
                <DisputeCardSkeleton key={i} />
            ))}
        </View>
    );

    const displayedDisputes = disputes.filter(item => {
        const isSettled = item.displayStatus === "Settled by Admin";
        if (selectedCategory === strings.client.disputes.pending) {
            return !isSettled;
        }
        if (selectedCategory === strings.client.disputes.settled) {
            return isSettled;
        }
        return true;
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.client.disputes.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {/* Main Type Toggle */}
                        <View style={styles.switcherWrapper}>
                            <ToggleSwitch
                                options={[
                                    strings.client.disputes.byClient,
                                    strings.client.disputes.forClient
                                ] as [string, string]}
                                onSelect={setSelectedType}
                                wrapperStyle={styles.toggleWrapper}
                                sliderStyle={styles.toggleSlider}
                                textStyle={styles.toggleText}
                                activeTextStyle={styles.toggleActiveText}
                                containerStyle={styles.toggleContainer}
                            />
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputWrapper}>
                                <Image
                                    source={require('@assets/images/common/searchIcon.png')}
                                    style={styles.searchIcon}
                                />
                                <TextInput allowFontScaling={false} placeholder={strings.client.disputes.searchPlaceholder}
                                    returnKeyType="done"
                                    style={[styles.searchInput, isInitialEmpty && { opacity: 0.5 }]}
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    editable={!isInitialEmpty}
                                />
                                <TouchableOpacity 
                                    style={[styles.filterBtn, isInitialEmpty && { opacity: 0.5 }]}
                                    onPress={() => setIsFilterModalVisible(true)}
                                    disabled={isInitialEmpty}
                                >
                                    <Image
                                        source={require('@assets/images/common/settingIcon.png')}
                                        style={[styles.searchIcon, { tintColor: (startDate || endDate) ? colors.primary : colors.gray }]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Categories Pills */}
                        {/* <View style={styles.categoryWrapper}>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={CATEGORIES}
                                keyExtractor={(item) => item}
                                contentContainerStyle={styles.categoryScroll}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryTab,
                                            selectedCategory === item && styles.activeCategoryTab,
                                            isInitialEmpty && { opacity: 0.5 }
                                        ]}
                                        onPress={() => setSelectedCategory(item)}
                                        disabled={isInitialEmpty}
                                    >
                                        <AppText style={[
                                            styles.categoryText,
                                            selectedCategory === item && styles.activeCategoryText
                                        ]}>
                                            {item}
                                        </AppText>
                                    </TouchableOpacity>
                                )}
                            />
                        </View> */}

                        {/* Dispute List */}
                        {loading && !refreshing ? (
                            renderSkeleton()
                        ) : (
                            <FlatList
                                data={displayedDisputes}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl 
                                        refreshing={refreshing} 
                                        onRefresh={() => fetchDisputes(1, true)} 
                                        colors={[colors.primary]} 
                                    />
                                }
                                onEndReached={() => {
                                    if (!loading && !isMoreLoading && hasMore) {
                                        fetchDisputes(page + 1);
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={() => (
                                    isMoreLoading ? (
                                        <View style={{ paddingVertical: 20 }}>
                                            <ActivityIndicator color={colors.primary} />
                                        </View>
                                    ) : null
                                )}
                                renderItem={({ item }) => (
                                    <DisputeCard 
                                        contractorName={getContractorName(item)}
                                        transactionId={item.disputeId}
                                        jobTitle={item.job?.title || item.subject}
                                        startDate={getLocalDateTime(item.createdAt).date}
                                        startTime={getLocalDateTime(item.createdAt).time}
                                        status={item.displayStatus === "Settled by Admin" ? 'Settled by Admin' : 'Pending from Admin'}
                                        evidenceList={item.evidence}
                                        onPress={() => navigation.navigate('DisputeDetails', { 
                                            disputeId: item._id,
                                            type: selectedType === strings.client.disputes.byClient ? 'by' : 'for'
                                        })}
                                        onViewAttachment={() => {
                                            let parsedEvidence = item.evidence;
                                            if (typeof parsedEvidence === 'string') {
                                                try {
                                                    const parsed = JSON.parse(parsedEvidence);
                                                    if (Array.isArray(parsed)) parsedEvidence = parsed;
                                                } catch (e) {
                                                    // Evidence string is not valid JSON; keep it as-is
                                                    if (__DEV__) devDebugger.warn('Failed to parse evidence JSON:', e);
                                                }
                                            }
                                            let evidenceArray: any[];
                                            if (Array.isArray(parsedEvidence)) {
                                                evidenceArray = parsedEvidence;
                                            } else if (parsedEvidence) {
                                                evidenceArray = [parsedEvidence];
                                            } else {
                                                evidenceArray = [];
                                            }
                                            
                                            if (evidenceArray.length === 0) {
                                                Toast.show({ type: 'info', text2: strings.auth.contractor.disputes.evidenceNotFound });
                                                return;
                                            }

                                            if (evidenceArray.length > 1) {
                                                setSheetEvidences(evidenceArray);
                                                setSheetJobTitle(item.job?.title || item.subject || 'Dispute Evidence');
                                                setIsSheetVisible(true);
                                                return;
                                            }

                                            const fileUrl = typeof evidenceArray[0] === 'string' ? evidenceArray[0] : evidenceArray[0].fileUrl;
                                            if (!fileUrl) {
                                                Toast.show({ type: 'error', text2: 'No valid attachment found.' });
                                                return;
                                            }
                                            const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
                                            const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
                                            if (!supportedExtensions.includes(ext)) {
                                                Toast.show({
                                                    type: 'error',
                                                    text2: 'Unsupported file format. This file is not viewable.'
                                                });
                                                return;
                                            }
                                            navigation.navigate('WebView', { 
                                                url: fileUrl, 
                                                title: 'Attachment'
                                            });
                                        }}
                                    />
                                )}
                                ListEmptyComponent={
                                    <EmptyState 
                                        imageSource={require('@assets/images/common/noData.png')}
                                        title={strings.client.disputes.noDisputesFound}
                                        description={strings.client.disputes.noDisputesDescription}
                                    />
                                }
                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                initialStartDate={startDate}
                initialEndDate={endDate}
                onApply={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                    setIsFilterModalVisible(false);
                }}
                onClear={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setIsFilterModalVisible(false);
                }}
            />

            <EvidenceSheetModal 
                visible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                evidences={sheetEvidences}
                jobTitle={sheetJobTitle}
            />
        </View>
    );
};

export default DisputeHistory;
