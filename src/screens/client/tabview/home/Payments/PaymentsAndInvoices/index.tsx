import { formatCurrency } from '@utils/currencyUtils';
import React, { useState, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';

import PaymentService from '@config/paymentService';
import PaymentsSkeleton from './components/PaymentsSkeleton';
import EmptyState from '@components/EmptyState';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import Svg, { Path } from 'react-native-svg';
import { getStatusStyles, formatTransactionType } from '@utils/statusUtils';
import { devDebugger } from '@utils/devDebugger';



const PaymentsAndInvoicesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientAppStackParamList>>();
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    
    // Debounced UI State for actually triggering the local filter
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    // Data State
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const t = strings.client.paymentsInvoices;

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Debounce logic for 3+ characters or empty string
        debounceTimer.current = setTimeout(() => {
            if (text.length >= 3 || text.length === 0) {
                setDebouncedSearchQuery(text);
            }
        }, 500);
    };

    const fetchPayments = async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else if (pageNum > 1) setIsMoreLoading(true);
            else setLoading(true);

            // Assuming getPaymentHistory takes params object now based on our change
            const response = await PaymentService.getPaymentHistory({
                page: pageNum,
                limit: 10
            });

            if (response.success && response.data) {
                // response.data already contains the 'results' object payload
                const newPayments = (response.data.payments || response.data.data || []).filter((p: any) => p.source !== 'addMoney');
                const pagination = response.data.pagination || null;

                if (pageNum === 1) {
                    setPayments(newPayments);
                } else {
                    setPayments(prev => [...prev, ...newPayments]);
                }

                if (pagination) {
                    setHasMore(pageNum < pagination.totalPages);
                } else {
                    setHasMore(newPayments.length === 10);
                }
                setPage(pageNum);
            } else {
                if (pageNum === 1) setPayments([]);
            }
        } catch (error) {
            devDebugger.error('Error fetching payments:', error);
            Toast.show({ type: 'error', text2: 'Failed to load payment history' });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPayments(1);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleRefresh = () => {
        fetchPayments(1, true);
    };

    const handleLoadMore = () => {
        if (!isMoreLoading && !loading && hasMore) {
            fetchPayments(page + 1);
        }
    };

    const filteredPayments = payments.filter(item => {
        const matchesSearch = debouncedSearchQuery.length >= 3 
            ? (item.jobTitle && item.jobTitle.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) || 
              (item.jobReference && item.jobReference.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            : true;
        
        let matchesFilter = true;
        if (selectedFilter !== 'All') {
            const status = item.paymentStatus?.toLowerCase() || '';
            if (selectedFilter === 'Success') {
                matchesFilter = ['paid', 'success', 'successful', 'completed'].includes(status);
            } else if (selectedFilter === 'Failed') {
                matchesFilter = ['failed', 'fail', 'declined', 'rejected', 'cancelled', 'canceled'].includes(status);
            } else {
                matchesFilter = status === selectedFilter.toLowerCase();
            }
        }
        
        return matchesSearch && matchesFilter;
    });

    const isDataEmpty = payments.length === 0;
    const isSearchOrFilterActive = debouncedSearchQuery.length >= 3 || selectedFilter !== 'All';
    // Disable inputs when there is absolutely no data to filter, and no active filter/search
    const shouldDisableControls = isDataEmpty && !isSearchOrFilterActive && !loading;

    const renderCard = ({ item }: { item: any }) => {
        const statusStyle = getStatusStyles(item.paymentStatus);
        
        return (
            <TouchableOpacity 
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PaymentInvoiceDetails', { transactionId: item.transactionId || item._id || item.id, invoiceData: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={require('@assets/images/common/clockGray.png')} 
                                style={[
                                    styles.iconSmall, 
                                    { marginRight: 0, width: 20, height: 20 }, 
                                    { tintColor: colors.primary }
                                ]} 
                            />
                        </View>
                        <View style={styles.titleContainer}>
                            <AppText style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</AppText>
                            <AppText style={styles.jobRef}>{t.jobRef} {item.jobReference}</AppText>
                            {item.transactionType && (
                                <AppText style={styles.transactionType} numberOfLines={1}>
                                    {formatTransactionType(item.transactionType)}
                                </AppText>
                            )}
                        </View>
                    </View>
                    <View style={[styles.statusBadge, statusStyle.badge]}>
                        <AppText style={[styles.statusText, statusStyle.text]}>
                            {statusStyle.label}
                        </AppText>
                    </View>
                </View>

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateItem}>
                        <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
                        <AppText style={styles.dateText}>{item.jobDateRange}</AppText>
                    </View>
                    <View style={styles.dateItem}>
                        <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
                        <AppText style={styles.dateText}>{item.jobTime}</AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.costRow}>
                    <View style={styles.costLabelRow}>
                        <View style={styles.smallIconContainer}>
                             <Image source={require('@assets/images/common/doller.png')} style={styles.costIcon1} />
                        </View>
                        <AppText style={styles.costLabel}>{t.totalCost || 'Total Cost'}</AppText>
                    </View>
                    <AppText style={styles.costValue}>{formatCurrency(item.netPayable || 0)}</AppText>
                </View>

                {Number(item.bookingFee || 0) > 0 && (
                    <View style={styles.costRow}>
                        <View style={styles.costLabelRow}>
                            <View style={styles.smallIconContainer}>
                                <Image source={require('@assets/images/common/resume.png')} style={styles.costIcon} />
                            </View>
                            <AppText style={styles.costLabel}>{t.bookingFee}</AppText>
                        </View>
                        <AppText style={styles.costValue}>{formatCurrency(item.bookingFee || 0)}</AppText>
                    </View>
                )}
                    {(item?.disputeFee > 0) && (item.transactionType !== 'paidToContractor') && (
                    <View style={styles.costRow}>
                        <View style={styles.costLabelRow}>
                            <View style={styles.smallIconContainer}>
                                <Image source={require('@assets/images/common/resume.png')} style={styles.costIcon} />
                            </View>
                            <AppText style={styles.costLabel}>{t.disputeFee}</AppText>
                        </View>
                        <AppText style={styles.costValue}>{formatCurrency(item.disputeFee || 0)}</AppText>
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.netPayableRow}>
                    <View style={styles.costLabelRow}>
                       <View style={styles.smallIconContainer}>
                            <Image source={require('@assets/images/common/paymnetInvoice.png')} style={styles.costIcon} />
                        </View>
                        <AppText style={styles.netPayableLabel}>
                            {item.transactionType?.toLowerCase().includes('refund') 
                                ? (t.refundAmount || 'Refund Amount') 
                                : (t.netPayable || 'Net Payable')}
                         </AppText>
                    </View>
                    <View style={styles.amountValueRow}>
                        {item.type === 'credit' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        )}
                        {item.type === 'debit' && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                                <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke={colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        )}
                        <AppText style={styles.netPayableValue}>{formatCurrency(item.totalCost || 0)}</AppText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={t.screenTitle} onBack={() => navigation.goBack()} />

            <View style={styles.searchContainer}>
                <View style={[styles.searchWrapper, shouldDisableControls && { opacity: 0.5 }]}>
                    <Image source={require('@assets/images/common/searchIcon.png')} style={styles.searchIcon} />
                    <TextInput allowFontScaling={false} style={styles.searchInput}
                        returnKeyType="done"
                        placeholder={t.searchPlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        editable={!shouldDisableControls}
                    />
                </View>

                <View style={[styles.filterTabsContainer, shouldDisableControls && { opacity: 0.5 }]}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterTabsContent}
                    >
                        {(t.filterTabs || ['All', 'Pending', 'Success', 'Failed']).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.filterTab, selectedFilter === tab && styles.filterTabActive]}
                                onPress={() => !shouldDisableControls && setSelectedFilter(tab)}
                                disabled={shouldDisableControls}
                                activeOpacity={0.7}
                            >
                                <AppText style={[styles.filterTabText, selectedFilter === tab && styles.filterTabTextActive]}>
                                    {tab}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {loading && page === 1 ? (
                <FlatList
                    data={[1, 2, 3]}
                    keyExtractor={(item) => item.toString()}
                    renderItem={() => <PaymentsSkeleton />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    data={filteredPayments}
                    keyExtractor={(item, index) => item.transactionId || index.toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        !loading ? (
                            <EmptyState 
                               title={t.noPaymentsFound}
                               description={t.noPaymentsDescription}
                               imageSource={require('@assets/images/common/noData.png')}
                            />
                        ) : null
                    }
                />
            )}
        </View>
    );
};

export default PaymentsAndInvoicesScreen;
