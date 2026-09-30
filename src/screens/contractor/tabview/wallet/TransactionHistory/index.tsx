// src/screens/contractor/tabview/wallet/TransactionHistory/index.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    Image, FlatList,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import TransactionHistoryCard from './components/TransactionHistoryCard';
import PaymentService from '@config/paymentService';
import SkeletonFrame from '@components/SkeletonFrame';
import EmptyState from '@components/EmptyState';
import { verticalScale, horizontalScale } from '@styles/mixins';
import { devDebugger } from '@utils/devDebugger';

const TransactionHistory = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const walletStrings = strings.auth.contractor.wallet;

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.length >= 3 || searchQuery.length === 0) {
                setDebouncedSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = debouncedSearch ? { search: debouncedSearch } : {};
            const res = await PaymentService.getContractorTransactions(params);
            if (res.success) {
                const source = res.data;
                const dataArray = Array.isArray(source) ? source : (source?.transactions || source?.data || source?.results || []);
                setTransactions(dataArray);
            }
        } catch (error) {
            devDebugger.error('Failed to fetch contractor transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [debouncedSearch]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const parseUtcDate = (isoString?: string | Date): Date => {
        if (!isoString) return new Date();
        if (isoString instanceof Date) return isoString;
        let str = String(isoString).trim();
        // If string is in ISO format with 'T' but missing UTC 'Z' or offset (+/-), treat as UTC
        if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
            str = `${str}Z`;
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? new Date(isoString) : d;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const d = parseUtcDate(isoString);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (isoString: string) => {
        if (!isoString) return '';
        const d = parseUtcDate(isoString);
        if (isNaN(d.getTime())) return '';
        const datePart = formatDate(isoString);
        const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${datePart} · ${timePart}`;
    };

    const renderSkeleton = () => (
        <View style={styles.listContent}>
            {[1, 2, 3].map((key) => (
                <View key={key} style={styles.skeletonCardView}>
                    <View style={styles.skeletonRowSpaced}>
                        <View style={styles.skeletonHeaderRow}>
                            <SkeletonFrame width={40} height={40} borderRadius={10} style={{ marginRight: horizontalScale(12) }} />
                            <View>
                                <SkeletonFrame width={100} height={14} style={{ marginBottom: verticalScale(4) }} />
                                <SkeletonFrame width={140} height={12} />
                            </View>
                        </View>
                        <SkeletonFrame width={60} height={18} />
                    </View>
                    <SkeletonFrame width="100%" height={1} style={{ marginBottom: verticalScale(12) }} />
                    <View style={styles.skeletonRowSpaced}>
                        <SkeletonFrame width={120} height={16} />
                        <SkeletonFrame width={60} height={16} />
                    </View>
                    <View style={styles.skeletonRowSpaced}>
                        <SkeletonFrame width={100} height={16} />
                        <SkeletonFrame width={130} height={16} />
                    </View>
                    <View style={styles.skeletonRowSpaced}>
                        <SkeletonFrame width={110} height={16} />
                        <SkeletonFrame width={90} height={16} />
                    </View>
                    <View style={styles.skeletonRow}>
                        <SkeletonFrame width={120} height={16} />
                        <SkeletonFrame width={80} height={16} />
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={walletStrings.transactionHistoryTitle}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Image
                        source={require('@assets/images/common/searchIcon.png')}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        allowFontScaling={false}
                        returnKeyType="done"
                        placeholder={walletStrings.searchTransactionPlaceholder}
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        editable={transactions.length > 0 || searchQuery.length > 0}
                    />

                </View>

                {loading && !refreshing ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        renderItem={({ item }) => {
                            return (
                                <TransactionHistoryCard
                                    txnId={item.transactionId || item._id}
                                    date={formatDateTime(item.createdAt)}
                                    amount={parseFloat(Number(item.amount || item.netAmount || 0).toFixed(2)).toString()}
                                    payoutDate={formatDate(item.dateOfPayment || item.createdAt)}
                                    status={item.status || 'Pending'}
                                    transactionType={item.transactionType}
                                    type={item.type}
                                    jobTitle={item.jobTitle || item.jobId?.title}
                                />
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                        }
                        ListEmptyComponent={
                            <EmptyState
                                title={walletStrings.noTransactionsFound}
                                description={walletStrings.noTransactionsDesc}
                                imageSource={require('@assets/images/common/noData.png')}
                            />
                        }
                    />
                )}
            </View>
        </View>
    );
};

export default TransactionHistory;
