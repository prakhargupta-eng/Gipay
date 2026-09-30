import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import SegmentedControl from '@components/SegmentedControl';
import CustomButton from '@components/CustomButton';
import EmptyState from '@components/EmptyState';
import { verticalScale } from '@styles/mixins';
import strings from '@constants/strings';
import colors from '@styles/colors';

import DisputeCard from './components/DisputeCard';
import DisputeCardSkeleton from './components/DisputeCardSkeleton';
import styles from './styles';
import DisputeService, { Dispute } from '@config/disputeService';
import FilterModal from '@components/FilterModal';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'DisputeHistory'>;

const CATEGORIES = [
    strings.auth.contractor.disputes.all,
    strings.auth.contractor.disputes.pending,
    strings.auth.contractor.disputes.settled
];


const DisputeHistory = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [selectedType, setSelectedType] = useState(strings.auth.contractor.disputes.byContractor);
    const [selectedCategory, setSelectedCategory] = useState(strings.auth.contractor.disputes.all);
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
    
    const debounceTimer = React.useRef<any>(null);
    const searchDebounceTimer = React.useRef<any>(null);

    /**
     * Fetches the list of disputes from the API.
     * @param isRefresh - Indicates if the call is triggered by pull-to-refresh.
     * @param isLoadMore - Indicates if the call is fetching the next page.
     */
    const fetchDisputes = React.useCallback(async (isRefresh = false, isLoadMore = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else if (isLoadMore) {
            if (!hasMore || isMoreLoading || loading) return;
            setIsMoreLoading(true);
        } else {
            setLoading(true);
        }

        const tab = selectedType === strings.auth.contractor.disputes.byContractor ? 'by' : 'for';
        const currentPage = isLoadMore ? page + 1 : 1;
        const searchParam = searchQuery.length >= 3 ? searchQuery : undefined;

        try {
            const response = await DisputeService.getContractorDisputes({ 
                tab, 
                page: currentPage, 
                limit: 10,
                search: searchParam,
                fromDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
                toDate: endDate ? endDate.toISOString().split('T')[0] : undefined
            });

            if (response.success && response.data) {
                const actualData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data as any).data || [];

                if (isLoadMore) {
                    setDisputes(prev => [...(Array.isArray(prev) ? prev : []), ...actualData]);
                    setPage(currentPage);
                } else {
                    setDisputes(actualData);
                    setPage(1);
                }
                setHasMore(actualData.length === 10);
            } else {
                if (!isLoadMore) setDisputes([]);
                setHasMore(false);
            }
        } catch (error) {
            devDebugger.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
        }
    }, [selectedType, searchQuery, startDate, endDate, page, hasMore, isMoreLoading, loading]);

    React.useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        if (searchQuery.length > 0 && searchQuery.length < 3) {
            return;
        }

        const delay = (searchQuery.length >= 3) ? 2000 : 500;

        debounceTimer.current = setTimeout(() => {
            fetchDisputes();
        }, delay);

        return () => clearTimeout(debounceTimer.current);
    }, [selectedType, searchQuery, startDate, endDate, selectedCategory]);

    const displayedDisputes = (Array.isArray(disputes) ? disputes : []).filter(item => {
        const isSettled = item.displayStatus === "Settled by Admin";
        if (selectedCategory === strings.auth.contractor.disputes.pending) {
            return !isSettled;
        }
        if (selectedCategory === strings.auth.contractor.disputes.settled) {
            return isSettled;
        }
        return true;
    });

    const renderSkeleton = () => (
        <View style={{ padding: 20 }}>
            {[1, 2, 3].map((_, i) => (
                <DisputeCardSkeleton key={i} />
            ))}
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.auth.contractor.disputes.screenTitle}
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
                                    strings.auth.contractor.disputes.byContractor,
                                    strings.auth.contractor.disputes.forContractor
                                ]}
                                onSelect={(type) => {
                                    setSelectedType(type);
                                    setSearchQuery('');
                                    setStartDate(null);
                                    setEndDate(null);
                                }}
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
                                <TextInput allowFontScaling={false} placeholder={strings.auth.contractor.disputes.searchPlaceholder}
                                    returnKeyType="done"
                                    style={styles.searchInput}
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <TouchableOpacity 
                                    style={styles.filterBtn}
                                    onPress={() => setIsFilterModalVisible(true)}
                                >
                                    <Image
                                        source={require('@assets/images/common/settingIcon.png')}
                                        style={[styles.searchIcon, { tintColor: (startDate || endDate) ? colors.primary : colors.gray }]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Categories Pills */}
                        <View style={styles.categoryWrapper}>
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
                                            selectedCategory === item && styles.activeCategoryTab
                                        ]}
                                        onPress={() => setSelectedCategory(item)}
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
                        </View>

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
                                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchDisputes(true)} colors={[colors.primary]} />
                                }
                                onEndReached={() => fetchDisputes(false, true)}
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
                                        title={item.job?.title || item.subject}
                                        company={item.job?.organizationName || 'N/A'} 
                                        dateRange={item.job ? `${getLocalDateTime(item.job.startDate).date} - ${getLocalDateTime(item.job.endDate).date}` : getLocalDateTime(item.createdAt).date}
                                        time={item.job?.startDate && item.job?.endDate ? `${getLocalDateTime(item.job.startDate).time} - ${getLocalDateTime(item.job.endDate).time}` : getLocalDateTime(item.createdAt).time}
                                        status={item.displayStatus === "Settled by Admin" ? 'Settled by Admin' : 'Pending from Admin'}
                                        evidenceList={item.evidence}
                                        onPress={() => navigation.navigate('DisputeDetails', { 
                                            disputeId: item._id,
                                            type: selectedType === strings.auth.contractor.disputes.byContractor ? 'by' : 'for'
                                        })}
                                        onViewAttachment={() => {
                                            let parsedEvidence = item.evidence;
                                            if (typeof parsedEvidence === 'string') {
                                                try {
                                                    const parsed = JSON.parse(parsedEvidence);
                                                    if (Array.isArray(parsed)) parsedEvidence = parsed;
                                                } catch (e) {}
                                            }
                                            const evidenceArray = Array.isArray(parsedEvidence) ? parsedEvidence : (parsedEvidence ? [parsedEvidence] : []);

                                            if (evidenceArray.length > 0) {
                                                const fileUrl = typeof evidenceArray[0] === 'string' ? evidenceArray[0] : evidenceArray[0].fileUrl;
                                                if (!fileUrl) {
                                                    Toast.show({ type: 'error', text2: 'No valid attachment found.' });
                                                    return;
                                                }
                                                const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
                                                const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
                                                if (!supportedExtensions.includes(ext)) {
                                                    Toast.show({ type: 'error', text2: 'Unsupported file format.' });
                                                    return;
                                                }
                                                navigation.navigate('WebView', { 
                                                    url: fileUrl, 
                                                    title: 'Attachment' 
                                                });
                                            } else {
                                                Toast.show({ type: 'info', text2: strings.auth.contractor.disputes.evidenceNotFound });
                                            }
                                        }}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View style={{ paddingTop: verticalScale(40) }}>
                                        <EmptyState 
                                            imageSource={require('@assets/images/common/noData.png')}
                                            title={strings.auth.contractor.disputes.noDisputesFound}
                                        description={strings.client.disputes.noDisputesDescription}
                                        />
                                    </View>
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
        </View>
    );
};

export default DisputeHistory;

