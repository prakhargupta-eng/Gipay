import { formatCurrency } from '@utils/currencyUtils';
// src/screens/contractor/tabview/wallet/ViewEarning/index.tsx

import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, FlatList, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import LinearGradient from '@components/LinearGradient';
import { useNavigation } from '@react-navigation/native';

import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import TransactionCard from './components/TransactionCard';
import DropdownField from '@components/DropdownField';
import AppText from '@components/AppText';
import PaymentService from '@config/paymentService';
import SkeletonFrame from '@components/SkeletonFrame';
import EmptyState from '@components/EmptyState';
import FilterModal from '@components/FilterModal';
import { verticalScale } from '@styles/mixins';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

const ViewEarning = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    const [earningsData, setEarningsData] = useState<any[]>([]);
    const [totalEarnings, setTotalEarnings] = useState('0.00');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const walletStrings = strings.auth.contractor.wallet;
    const isFiltersDisabled = earningsData.length === 0 && !loading && !searchQuery && filterStatus === 'All' && !startDate && !endDate;

    const filterOptions = [
        { label: walletStrings.filterOptions?.all, value: 'All' },
        { label: walletStrings.filterOptions?.pending, value: 'Pending' },
        { label: walletStrings.filterOptions?.success, value: 'Paid' }
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.length >= 3 || searchQuery.length === 0) {
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchEarnings = async (pageNumber: number, isRefresh = false) => {
        try {
            if (pageNumber === 1 && !isRefresh) setLoading(true);
            if (pageNumber > 1) setLoadingMore(true);

            const params: any = { page: pageNumber, limit: 10 };
            if (debouncedSearch) params.searchKey = debouncedSearch;
            if (filterStatus !== 'All') params.status = filterStatus.toLowerCase();
            if (startDate) params.startDate = startDate.toISOString();
            if (endDate) params.endDate = endDate.toISOString();

            const res = await PaymentService.getContractorEarnings(params);

            if (res.success) {
                const source = res.data;
                const newEarnings = source?.earnings || [];
                const total = source?.totalEarnings || 0;

                if (pageNumber === 1) {
                    setTotalEarnings(parseFloat(Number(total).toFixed(2)).toString());
                }

                if (newEarnings.length < 10) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (isRefresh || pageNumber === 1) {
                    setEarningsData(newEarnings);
                } else {
                    setEarningsData(prev => [...prev, ...newEarnings]);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
            devDebugger.error('Failed to fetch contractor earnings:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchEarnings(1, true);
    }, [debouncedSearch, filterStatus, startDate, endDate]);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchEarnings(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchEarnings(nextPage);
        }
    };

    const renderSkeleton = () => (
        <View style={styles.listContent}>
            {[1, 2, 3].map((key) => (
                <View key={key} style={styles.skeletonCard}>
                    <View style={styles.skeletonRowMb4}>
                        <SkeletonFrame width={120} height={18} />
                        <SkeletonFrame width={60} height={20} borderRadius={8} />
                    </View>
                    <SkeletonFrame width={180} height={14} style={styles.skeletonMb12} />
                    <SkeletonFrame width="100%" height={1} style={styles.skeletonMb12} />
                    <View style={styles.skeletonRowMb10}>
                        <SkeletonFrame width={140} height={16} />
                        <SkeletonFrame width={60} height={16} />
                    </View>
                    <View style={styles.skeletonRowMb10}>
                        <SkeletonFrame width={120} height={16} />
                        <SkeletonFrame width={50} height={16} />
                    </View>
                    <View style={styles.skeletonRowMb10}>
                        <SkeletonFrame width={100} height={16} />
                        <SkeletonFrame width={70} height={16} />
                    </View>
                    <View style={styles.skeletonRowMb10}>
                        <SkeletonFrame width={90} height={16} />
                        <SkeletonFrame width={130} height={16} />
                    </View>
                    <View style={styles.skeletonRow}>
                        <SkeletonFrame width={90} height={16} />
                        <SkeletonFrame width={150} height={16} />
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={walletStrings.viewEarningDetailTitle}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.content}>
                {/* Total Earnings Card */}
                <LinearGradient
                    colors={colors.walletGradient}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.earningsCardView}
                >
                    <View style={styles.earningsCard}>
                        <AppText style={styles.cardLabel}>{walletStrings.totalEarnings}</AppText>
                        {loading && !refreshing && page === 1 ? (
                            <SkeletonFrame width={120} height={verticalScale(50)} borderRadius={8} />
                        ) : (
                            <AppText style={styles.cardValue}>{formatCurrency(totalEarnings)}</AppText>
                        )}
                    </View>
                </LinearGradient>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Image
                        source={require('@assets/images/common/searchIcon.png')}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        allowFontScaling={false}
                        returnKeyType="done"
                        placeholder={walletStrings.searchJobsPlaceholder}
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        editable={!isFiltersDisabled}
                    />
                    <TouchableOpacity
                        style={[styles.filterBtn, isFiltersDisabled && { opacity: 0.5 }]}
                        onPress={() => setIsFilterModalVisible(true)}
                        disabled={isFiltersDisabled}
                    >
                        <Image
                            source={require('@assets/images/common/settingIcon.png')}
                            style={[
                                styles.filterIcon,
                                (startDate || endDate) ? styles.activeFilterIcon : null
                            ]}
                        />
                    </TouchableOpacity>
                </View>

                {/* Filter Dropdown */}
                <View style={styles.filterRow}>
                    <DropdownField
                        data={filterOptions}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        wrapperStyle={styles.dropdownWrapper}
                        containerStyle={styles.dropdownContainer}
                        disabled={isFiltersDisabled}
                    />
                </View>

                {/* Transaction List */}
                {loading && !refreshing && page === 1 ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={earningsData}
                        keyExtractor={(item, index) => item.transactionId || index.toString()}
                        renderItem={({ item }) => {
                            

                            return (
                                <TransactionCard
                                    title={item.jobTitle || ''}
                                    transactionId={item.transactionId || ''}
                                    grossAmount={parseFloat(Number(item.grossAmount || 0).toFixed(2)).toString()}
                                    fee={parseFloat(Number(item.fee || item.transactionFee || 0).toFixed(2)).toString()}
                                    netAmount={parseFloat(Number(item.netAmount || 0).toFixed(2)).toString()}
                                    time={`${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`}
                                    date={`${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`}
                                    status={item.status}
                                    onPress={() => navigation.navigate('ContractorTransactionDetails', { txnId: item.transactionId || item._id })}
                                />
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={styles.footerLoader}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <EmptyState
                                title={strings.auth.contractor.wallet.noEarningsTitle}
                                description={strings.auth.contractor.wallet.noEarningsDesc}
                                imageSource={require('@assets/images/common/noData.png')}
                            />
                        }
                    />
                )}

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
        </View>
    );
};

export default ViewEarning;
