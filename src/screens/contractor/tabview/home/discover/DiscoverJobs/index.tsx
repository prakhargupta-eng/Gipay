import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, ScrollView, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import DiscoverJobCard from './components/DiscoverJobCard';
import DiscoverSkeleton from './components/DiscoverSkeleton';
import ContractorService from '@config/contractorService';
import styles from './styles';
import colors from '@styles/colors';
import FilterModal from '@components/FilterModal';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { verticalScale } from '@styles/mixins';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList, 'DiscoverJobs'>;

const CATEGORIES = [
    strings.auth.contractor.discover.all,
    strings.auth.contractor.discover.nearby,
    strings.auth.contractor.discover.highestPay,
    strings.auth.contractor.discover.mostRecent
];

const LIMIT = 10;

const DiscoverJobsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [selectedCategory, setSelectedCategory] = useState(strings.auth.contractor.discover.all);
    const [searchQuery, setSearchQuery] = useState('');
    
    // API State
    const [jobs, setJobs] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    /**
     * Main Data Fetcher
     */
    const fetchJobs = useCallback(async (pageNum: number, shouldRefresh = false, currentSearch = '', currentFilter = '') => {
        try {
            if (pageNum === 1 && !shouldRefresh) setIsLoading(true);
            
            const res = await ContractorService.discoverJobs({
                filter: currentFilter || selectedCategory,
                limit: LIMIT,
                page: pageNum,
                search: currentSearch || undefined,
                fromDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
                toDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
            });

            if (res.success && res.data) {
                const newJobs = res.data.data || (Array.isArray(res.data) ? res.data : []);
                
                if (shouldRefresh) {
                    setJobs(newJobs);
                } else {
                    setJobs(prev => [...prev, ...newJobs]);
                }
                
                
                setHasMore(newJobs.length === LIMIT);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            devDebugger.error('Error fetching discover jobs:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, [selectedCategory, startDate, endDate]);

    /**
     * Unified Effect for Search and Filter
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            // Trigger API only if search is 0 or >= 3
            if (searchQuery.length === 0 || searchQuery.length >= 3) {
                setPage(1);
                setHasMore(true);
                fetchJobs(1, true, searchQuery, selectedCategory);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, startDate, endDate]);

    const onRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchJobs(1, true, searchQuery, selectedCategory);
    };

    const onLoadMore = () => {
        if (!isLoadingMore && hasMore && !isLoading) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchJobs(nextPage, false, searchQuery, selectedCategory);
        }
    };

    const renderFooter = () => {
        if (!isLoadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={styles.loaderFooter}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={{ paddingTop: verticalScale(40) }}>
                <EmptyState 
                    imageSource={require('@assets/images/common/noData.png')}
                    title={strings.auth.contractor.discover.noJobsFound}
                    description={strings.auth.contractor.discover.noJobsFoundDesc}
                />
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
            <TopHeader 
                title={strings.auth.contractor.discover.screenTitle} 
                onBack={() => navigation.goBack()} 
            />

            <View style={styles.content}>
                {/* Search Bar & Filter */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Image 
                            source={require('@assets/images/common/searchIcon.png')} 
                            style={styles.searchIcon} 
                        /> 
                        <TextInput allowFontScaling={false} placeholder={strings.auth.contractor.discover.searchPlaceholder} 
                            returnKeyType="done"
                            style={styles.searchInput}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                        />
                        <TouchableOpacity 
                            style={styles.filterBtn} 
                            activeOpacity={0.7}
                            onPress={() => setIsFilterModalVisible(true)}
                        >
                        <Image 
                            source={require('@assets/images/common/settingIcon.png')} 
                            style={[styles.filterIcon, { tintColor: (startDate || endDate) ? colors.primary : colors.gray }]} 
                        />
                    </TouchableOpacity>
                    </View>
                    
                </View>

                {/* Categories */}
                <View style={styles.categoryWrapper}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity 
                                key={cat}
                                style={[
                                    styles.categoryTab,
                                    selectedCategory === cat && styles.activeCategoryTab
                                ]}
                                onPress={() => {
                                    setSelectedCategory(cat);
                                    setSearchQuery(''); // Clear search when switching categories
                                }}
                                activeOpacity={0.7}
                            >
                                <AppText style={[
                                    styles.categoryText,
                                    selectedCategory === cat && styles.activeCategoryText
                                ]}>
                                    {cat}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Job List or Skeleton */}
                {isLoading && page === 1 ? (
                    <DiscoverSkeleton />
                ) : (
                    <FlatList
                        data={jobs}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        contentContainerStyle={styles.jobList}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <DiscoverJobCard 
                                id={item.id}
                                title={item.title}
                                company={item.organizationName}
                                rating={item.rating?.toString() || '0.0'}
                                distance={item.distance || '0km'}
                                dateRange={`${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`}
                                time={`${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`}
                                rate={item.hourlyRate}
                                address={item.location}
                                status={item.status}
                                onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
                            />
                        )}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                        }
                        onEndReached={onLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                    />
                )}
            </View>
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

export default DiscoverJobsScreen;
