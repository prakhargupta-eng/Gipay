import { formatCurrency } from '@utils/currencyUtils';
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
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import { horizontalScale, verticalScale } from '@styles/mixins';
import { getJobInvites } from '@config/invitationService';
import InviteCardSkeleton from './components/InviteCardSkeleton';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { getStatusStyles } from '@utils/statusUtils';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'JobInvites'>;

const FILTERS = ['All', 'Pending', 'Rejected', 'Accepted'];

const JobInvitesScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const debounceTimer = useRef<any>(null);
    const filterDebounceTimer = useRef<any>(null);
    const isFetchingRef = useRef(false);
    const searchRef = useRef(searchQuery);
    const filterRef = useRef(selectedFilter);
    const initialFocusRef = useRef(true);
    const mountedRef = useRef(false);

    useEffect(() => {
        searchRef.current = searchQuery;
    }, [searchQuery]);

    const fetchInvitations = useCallback(async (pageNum: number, isPullToRefresh: boolean = false, isSilent: boolean = false) => {
        if (isFetchingRef.current) {
            if (isPullToRefresh) {
                // Fix for iOS RefreshControl spinning indefinitely if state isn't toggled
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 100);
            }
            return;
        }

        try {
            isFetchingRef.current = true;
            if (isPullToRefresh) {
                setRefreshing(true);
            } else if (pageNum > 1) {
                setIsMoreLoading(true);
            } else if (!isSilent) {
                setLoading(true);
            }

            const statusVal = filterRef.current.toLowerCase();
            const params: any = {
                filter: 'all',
                page: pageNum,
                limit: 10,
            };

            if (statusVal !== 'all') {
                params.status = statusVal;
            }

            const searchVal = searchRef.current.trim();
            if (searchVal.length >= 3) {
                params.search = searchVal;
            }

            const res = await getJobInvites(params);

            // Artificial delay to show skeleton loader
            await new Promise<void>(resolve => setTimeout(resolve, 1500));

            if (res.success && res.data) {
                let results = [];
                let pagination = null;

                if (Array.isArray(res.data)) {
                    results = res.data;
                } else if (res.data && Array.isArray((res.data as any).results)) {
                    results = (res.data as any).results;
                    pagination = (res.data as any).pagination;
                } else if (res.data && Array.isArray((res.data as any).data)) {
                    results = (res.data as any).data;
                    pagination = (res.data as any).pagination;
                }

                // Map backend response keys to properties expected by the card layout
                const mappedResults = results.map((item: any) => {
                    const contractorObj = item.contractor || {};
                    const jobObj = item.job || {};

                    return {
                        invitationId: item.invitationId || item.id || item._id,
                        contractorId: contractorObj.id || contractorObj._id || item.contractorId || '',
                        contractorName: contractorObj.fullName || contractorObj.name || item.contractorName || strings.client.jobInvites.unknownContractor,
                        invitationStatus: item.invitationStatus || item.status || 'pending',
                        contractorHourlyRate: item.contractorHourlyRate || contractorObj.hourlyRate || item.hourlyRate || 0,
                        jobTitle: jobObj.title || item.jobTitle || item.title || strings.client.jobInvites.noTitle,
                        jobRate: item.jobRate || jobObj.hourlyRate || item.hourlyRate || 0,
                        jobStartDate: item.jobStartDate || jobObj.startDate || item.startDate || '',
                        jobEndDate: item.jobEndDate || jobObj.endDate || item.endDate || '',
                        jobStartTime: item.jobStartTime || jobObj.startTime || item.startTime || '',
                        jobEndTime: item.jobEndTime || jobObj.endTime || item.endTime || '',
                        totalJobHours: item.totalJobHours || jobObj.totalHours || item.totalHours || 0,
                        ...item,
                    };
                });

                if (isPullToRefresh || pageNum === 1) {
                    setInvitations(mappedResults);
                    setPage(1);
                } else {
                    setInvitations(prev => [...prev, ...mappedResults]);
                    setPage(pageNum);
                }

                if (pagination && pagination.page !== undefined && pagination.pages !== undefined) {
                    setHasMore(pagination.page < pagination.pages);
                } else {
                    setHasMore(results.length === 10);
                }
            } else {
                Toast.show({
                    type: 'error',
                    text2: res.message || strings.client.jobInvites.failedToFetch
                });
            }
        } catch (error: any) {
            devDebugger.error('Error fetching job invites:', error);
            Toast.show({
                type: 'error',
                text2: error.message || strings.client.jobInvites.unexpectedError
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (initialFocusRef.current) {
                initialFocusRef.current = false;
                fetchInvitations(1, false, false);
            } else {
                // Silently refresh on focus return to avoid triggering RefreshControl offset bug on iOS
                fetchInvitations(1, false, true);
            }
        }, [fetchInvitations])
    );

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (searchQuery.length > 0 && searchQuery.length < 3) {
            return;
        }

        const delay = searchQuery.length >= 3 ? 800 : 300;

        // Show skeleton immediately while debouncing search
        setLoading(true);

        debounceTimer.current = setTimeout(() => {
            fetchInvitations(1);
        }, delay);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchQuery, fetchInvitations]);

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        filterRef.current = filter;

        if (filterDebounceTimer.current) {
            clearTimeout(filterDebounceTimer.current);
        }

        // Show skeleton immediately
        setLoading(true);

        filterDebounceTimer.current = setTimeout(() => {
            fetchInvitations(1);
        }, 1000); // 1-second debounce delay
    };

    const renderItem = ({ item }: { item: any }) => {
        const statusStyle = getStatusStyles(item.invitationStatus);
        const formattedStartDate = getLocalDateTime(item.jobStartDate).date;
        const formattedEndDate = getLocalDateTime(item.jobEndDate).date;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('JobInviteDetails', { invitationId: item.invitationId })}
                activeOpacity={0.8}
            >
                {/* Header Section */}
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, marginRight: horizontalScale(12) }}>
                        <AppText style={styles.contractorName} numberOfLines={1}>{item.contractorName}</AppText>
                        <AppText style={styles.hourlyRateText} numberOfLines={1}>{strings.client.jobInvites.hourlyRate} {formatCurrency(item.contractorHourlyRate)}/h</AppText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.badge.backgroundColor, flexShrink: 1, marginLeft: horizontalScale(8) }]}>
                        <AppText style={[styles.statusText, { color: statusStyle.text.color }]} numberOfLines={1} ellipsizeMode="tail">
                            {statusStyle.label}
                        </AppText>
                    </View>
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

                {/* Job Info Section */}
                <View style={styles.jobInfo}>
                    <AppText style={styles.jobTitle}>{item.jobTitle}</AppText>

                    <View style={styles.rateRow}>
                        <Image
                            source={require('@assets/images/common/doller.png')}
                            style={styles.icon}
                            tintColor="#9CA3AF"
                        />
                        <AppText style={styles.detailText}>{strings.client.jobInvites.jobRate} {formatCurrency(item.jobPrice)}/h</AppText>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Image
                                source={require('@assets/images/common/calander.png')}
                                style={styles.icon}
                                tintColor="#9CA3AF"
                            />
                            <AppText style={styles.detailText}>{formattedStartDate} - {formattedEndDate}</AppText>
                        </View>
                        <View style={[styles.detailItem, { marginLeft: horizontalScale(10) }]}>
                            <Image
                                source={require('@assets/images/common/blackClock.png')}
                                style={styles.icon}
                                tintColor="#9CA3AF"
                            />
                            <AppText style={styles.detailText}>{getLocalDateTime(item.jobStartDate).time} - {getLocalDateTime(item.jobEndDate).time} </AppText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSkeleton = () => (
        <View style={styles.listContent}>
            {[1, 2, 3, 4].map((_, i) => (
                <InviteCardSkeleton key={i} />
            ))}
        </View>
    );

    // Disable search/filters only if there is absolutely no data on the default state
    const isFiltersDisabled = invitations.length === 0 && !loading && !searchQuery && selectedFilter === 'All';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.client.jobInvites.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputWrapper}>
                                <Image
                                    source={require('@assets/images/common/searchIcon.png')}
                                    style={styles.searchIcon}
                                />
                                <TextInput allowFontScaling={false} placeholder={strings.client.jobInvites.searchPlaceholder}
                                    returnKeyType="done"
                                    style={styles.searchInput}
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    editable={!isFiltersDisabled}
                                />
                            </View>

                            {/* Filter Chips */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterScrollContent}
                                style={[styles.filterScroll, isFiltersDisabled && { opacity: 0.5 }]}
                            >
                                {FILTERS.map(filter => {
                                    const isActive = selectedFilter === filter;
                                    const getFilterText = (filterType: string) => {
                                        switch (filterType) {
                                            case 'All': return strings.client.jobInvites.filterOptions.all;
                                            case 'Pending': return strings.client.jobInvites.filterOptions.pending;
                                            case 'Rejected': return strings.client.jobInvites.filterOptions.rejected;
                                            default: return strings.client.jobInvites.filterOptions.accepted;
                                        }
                                    };
                                    const filterText = getFilterText(filter);
                                    return (
                                        <TouchableOpacity
                                            key={filter}
                                            disabled={isFiltersDisabled}
                                            style={[
                                                styles.filterChip,
                                                isActive && styles.filterChipActive
                                            ]}
                                            onPress={() => handleFilterChange(filter)}
                                        >
                                            <AppText style={[
                                                styles.filterChipText,
                                                isActive && styles.filterChipTextActive
                                            ]}>{filterText}</AppText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* List */}
                        {loading && !refreshing ? (
                            renderSkeleton()
                        ) : (
                            <FlatList
                                data={invitations}
                                keyExtractor={(item) => item.invitationId}
                                renderItem={renderItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => fetchInvitations(1, true, false)}
                                        colors={[colors.primary]}
                                    />
                                }
                                onEndReached={() => {
                                    if (!loading && !isMoreLoading && hasMore) {
                                        fetchInvitations(page + 1);
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
                                ListEmptyComponent={() => (
                                    <View style={{ paddingTop: verticalScale(40) }}>
                                        <EmptyState
                                            imageSource={require('@assets/images/common/noData.png')}
                                            title={strings.client.jobInvites.noJobInvitesFound}
                                            description={strings.client.jobInvites.noJobInvitesDesc}
                                        />
                                    </View>
                                )}

                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
};

export default JobInvitesScreen;
