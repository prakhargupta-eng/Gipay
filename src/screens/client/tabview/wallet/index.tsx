import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';
import colors from '@styles/colors';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import PaymentService from '@config/paymentService';
import strings, {CURRENCY} from '@constants/strings';
import SkeletonFrame from '@components/SkeletonFrame';
import WalletTransactionItem from './components/WalletTransactionItem';
import { getTimeAgo } from '@utils/dateUtils';
import EmptyState from '@components/EmptyState';

interface PaymentItem {
  transactionId: string;
  type: string;
  contractorName: string;
  status: string;
  date: string;
  time: string;
  amount: number;
  transactionType?: string;
}

const getInitials = (name: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const PaymentSkeleton = () => (
  <View style={styles.paymentCard}>
    <View style={[styles.avatar, { overflow: 'hidden' }]}>
      <SkeletonFrame width="100%" height="100%" borderRadius={100} />
    </View>
    <View style={[styles.paymentDetails, { justifyContent: 'center' }]}>
      <SkeletonFrame width={120} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
      <SkeletonFrame width={100} height={14} borderRadius={4} />
    </View>
    <View style={[styles.amountContainer, { justifyContent: 'center', alignItems: 'flex-end' }]}>
      <SkeletonFrame width={60} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
      <SkeletonFrame width={70} height={24} borderRadius={12} />
    </View>
  </View>
);

const WalletScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const t = strings.client.wallet;

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await PaymentService.getWalletDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        Toast.show({ type: 'error', text2: response.message || 'Failed to load data' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text2: 'An error occurred' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleAddMoney = () => {
    navigation.navigate('PaymentMethod');
  };

  const handleSeeAll = () => {
    navigation.navigate('TransactionHistory');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Banner Gradient Area */}
      <ImageBackground
        source={require('@assets/images/contractor/homeTopBg.png')}
        style={[styles.headerContainer, { paddingTop: insets.top }]}
        resizeMode="cover"
      >
        {/* Header Title & Notification Button */}
        <View style={styles.headerTop}>
          <AppText style={styles.headerTitle}>{t.screenTitle}</AppText>
        </View>

        {/* Escrow Balance Card */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowTopRow}>
            <AppText style={styles.escrowLabel}>{t.availableBalance}</AppText>
            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={handleAddMoney}
              activeOpacity={0.8}
            >
              <AppText style={styles.addMoneyText}>{t.addMoney}</AppText>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ marginTop: 8, marginBottom: 4 }}>
              <SkeletonFrame width={140} height={36} borderRadius={8} />
            </View>
          ) : (
            <AppText style={styles.escrowAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {dashboardData?.totalInEscrow != null
                ? `${formatCurrency(dashboardData.availableBalance)}`
                : `${CURRENCY}0.00`}
            </AppText>
          )}
        </View>
      </ImageBackground>
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <AppText style={styles.sectionTitle}>{t.recentJobPayments}</AppText>
        {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
          <TouchableOpacity onPress={handleSeeAll}>
            <AppText style={styles.seeAllText}>{t.seeAll}</AppText>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Recent Job Payments Section */}
      {loading ? (
        <View style={styles.scrollContent}>
          <PaymentSkeleton />
          <PaymentSkeleton />
          <PaymentSkeleton />
          <PaymentSkeleton />
          <PaymentSkeleton />
        </View>
      ) : (
        <FlatList
          data={dashboardData?.recentTransactions || []}
          keyExtractor={(item) => item.transactionId}
          renderItem={({ item }) => {

            return (
              <WalletTransactionItem
                jobTitle={item.jobTitle} // Maps to jobDetails/name
                transactionId={item.transactionId}
                timeAgo={getTimeAgo(item.dateTime)}
                amount={`${formatCurrency(item.amount)}`}
                status={item.status}
                transactionType={item.transactionType}
                type={item.type}
                onPress={() => navigation.navigate('WalletPaymentDetails', { transactionId: item.transactionId, invoiceData: item })}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              imageSource={require('@assets/images/common/noData.png')}
              title={t.noTransactionsTitle}
              description={t.noTransactionsDesc}
            />
          }
          ListFooterComponent={<View style={styles.bottomSpacer} />}
        />
      )}
    </View>
  );
};

export default WalletScreen;
