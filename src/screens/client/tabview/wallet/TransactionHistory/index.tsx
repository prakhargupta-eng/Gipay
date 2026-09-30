import { CURRENCY } from '@constants/strings';
import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import WalletTransactionItem from '../components/WalletTransactionItem';
import AppText from '@components/AppText';
import FilterModal from './components/FilterModal';
import styles from './styles';
import strings from '@constants/strings';
import PaymentService from '@config/paymentService';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@styles/colors';
import EmptyState from '@components/EmptyState';
import { getTimeAgo } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

const PAGE_LIMIT = 10;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });

  const fetchTransactions = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Build params based on API expected format and state
      const params: any = {
        page: pageNum,
        limit: PAGE_LIMIT,
      };

      if (filters.status !== 'all') {
        if (filters.status === 'successful') params.status = 'Successful';
        if (filters.status === 'pending') params.status = 'Pending';
        if (filters.status === 'failed') params.status = 'Rejected';
      }
      
      if (filters.type !== 'all') {
        if (filters.type === 'paid') params.type = 'Paid to contractor';
        if (filters.type === 'add') params.type = 'Add money';
        if (filters.type === 'withdrawn') params.type = 'Withdrawn';
      }

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await PaymentService.getWalletTransactions(params);
      
      if (response?.data?.transactions) {
        const newTx = response.data.transactions;
        if (pageNum === 1) {
          setTransactions(newTx);
        } else {
          setTransactions(prev => [...prev, ...newTx]);
        }
        
        // Update total
        if (response.data.pagination?.total) {
          setTotalCount(response.data.pagination.total);
        } else {
          setTotalCount(pageNum === 1 ? newTx.length : totalCount + newTx.length);
        }

        // Check if has more
        if (newTx.length < PAGE_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      devDebugger.log('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setPage(1);
    fetchTransactions(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, false);
    }
  };

  const applyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count += 1;
    if (filters.type !== 'all') count += 1;
    if (filters.dateRange !== 'all' || filters.startDate !== '' || filters.endDate !== '') count += 1;
    return count;
  };

  const appliedFiltersCount = getAppliedFiltersCount();
  const isFilterApplied = appliedFiltersCount > 0;

  const renderFilterButton = () => (
    <TouchableOpacity 
      style={styles.filterIconContainer} 
      activeOpacity={0.7}
      onPress={() => setIsFilterVisible(true)}
    >
      <Image source={require('@assets/images/common/settingIcon.png')} style={[styles.filterIcon, isFilterApplied && { tintColor: colors.primary }]} />
      {appliedFiltersCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -5,
          right: -5,
          backgroundColor: colors.primary,
          borderRadius: 10,
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: colors.white
        }}>
          <AppText style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>{appliedFiltersCount}</AppText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: horizontalScale(20), flex: 1, marginTop: verticalScale(10) }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingVertical: verticalScale(16),
          paddingHorizontal: horizontalScale(16),
          backgroundColor: colors.white,
          borderRadius: 16,
          marginBottom: verticalScale(12),
          borderWidth: 1,
          borderColor: '#F3F4F6', // Similar to Colors.statBorder
        }}>
          <SkeletonFrame width={horizontalScale(48)} height={horizontalScale(48)} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: horizontalScale(14) }}>
            <SkeletonFrame width={120} height={16} style={{ marginBottom: verticalScale(8) }} />
            <SkeletonFrame width={160} height={12} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <SkeletonFrame width={60} height={18} style={{ marginBottom: verticalScale(8) }} />
            <SkeletonFrame width={70} height={26} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <TopHeader 
        title="Transaction History" 
        onBack={() => navigation.goBack()} 
      />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <AppText style={styles.totalTitle}>{strings.client.wallet.totalTransactions}</AppText>
            <AppText style={styles.totalCount}>{totalCount}</AppText>
          </View>
          
         {renderFilterButton()}
        </View>

        {isLoading && page === 1 && transactions.length === 0 ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item, index) => item.transactionId || index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={{ paddingVertical: verticalScale(20), alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState 
                title={strings.client.wallet.noTransactionsTitle} 
                description={strings.client.wallet.noTransactionHistoryDesc} 
                imageSource={require('@assets/images/common/noData.png')} 
              />
            }
            renderItem={({ item }) => {
                
              // Ensure item.amount is treated as a number before calling toFixed
              const parsedAmount = Number(item.amount) || 0;
              const amountText = `${formatCurrency(parsedAmount)}`;

              return (
                <WalletTransactionItem
                  jobTitle={item.jobTitle}
                  transactionId={item.transactionId || 'Transaction'}
                  timeAgo={getTimeAgo(item.dateTime)}
                  amount={amountText}
                  status={item.status as any}
                  onPress={() => navigation.navigate('WalletPaymentDetails', { transactionId: item.transactionId || item._id || item.id, invoiceData: item })}
                  transactionType={item.transactionType}
                  type={item.type}
                />
              );
            }}
          />
        )}
      </View>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={applyFilters}
      />
    </View>
  );
};

export default TransactionHistoryScreen;
