import React, { useState, useCallback, useRef } from 'react';
import { View, FlatList, Image, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';

import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import JobMatchSkeleton from './components/JobMatchSkeleton';
import JobMatchCard from './components/JobMatchCard';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';


const EmptyView = ({ selectedTab, t }: { selectedTab: string; t: any }) => (
    <View style={styles.emptyContainer}>
        <Image
            source={require('@assets/images/common/noData.png')}
            style={styles.emptyImage}
            resizeMode="contain"
        />
        <AppText style={styles.emptyTitle}>
            {t.noMatchesTitle(selectedTab)}
        </AppText>
        <AppText style={styles.emptySubtitle}>
            {t.noMatchesDesc(selectedTab)}
        </AppText>
    </View>
);

const ListFooter = ({ isMoreLoading }: { isMoreLoading: boolean }) => (
    isMoreLoading ? (
        <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color={colors.primary} />
        </View>
    ) : null
);

const JobMatchesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientAppStackParamList>>();
    const t = strings.client.jobMatches;

    // States
    const [selectedTab, setSelectedTab] = useState(t.pending);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [actionLoadingState, setActionLoadingState] = useState<{ id: string, action: 'accept' | 'reject' } | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Refs
    const tabRef = useRef(selectedTab);
    const isFetchingRef = useRef(false);
    const isFirstMount = useRef(true);
    const tabDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


    // Fetch Matches
    const fetchMatches = useCallback(async (pageNum: number = 1, isRefresh: boolean = false, showSpinner: boolean = false) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            if (isRefresh) {
                if (showSpinner) {
                    setRefreshing(true);
                }
            } else if (pageNum > 1) {
                setIsMoreLoading(true);
            } else {
                setLoading(true);
            }

            const currentTab = tabRef.current;
            const limit = 10;

            let response;
            if (currentTab === t.pending) {
                response = await JobService.getPendingMatches(pageNum, limit);
            } else {
                response = await JobService.getConfirmedMatches(pageNum, limit);
            }

            if (response.success && response.data) {
                const newMatches = response.data.results?.data || response.data.data || [];
                const pagination = response.data.results?.pagination || response.data.pagination;

                if (pageNum === 1) {
                    setMatches(newMatches);
                } else {
                    setMatches(prev => [...prev, ...newMatches]);
                }

                setPage(pageNum);
                if (pagination) {
                    setHasMore(pageNum < pagination.totalPages);
                } else {
                    setHasMore(newMatches.length === limit);
                }
            } else {
                if (pageNum === 1) setMatches([]);
                setHasMore(false);
            }
        } catch (error: any) {
            devDebugger.error('Error fetching job matches:', error);
            Toast.show({
                type: 'error',
                text2: error.message || 'An unexpected error occurred'
            });
            if (pageNum === 1) setMatches([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
            isFetchingRef.current = false;
        }
    }, [t.pending]);

    // Handle Tab Change with Debounce
    const handleTabChange = (val: string) => {
        setSelectedTab(val);
        tabRef.current = val;

        if (tabDebounceTimer.current) {
            clearTimeout(tabDebounceTimer.current);
        }

        // Show skeleton loader immediately while debouncing
        setLoading(true);

        tabDebounceTimer.current = setTimeout(() => {
            fetchMatches(1, false);
        }, 500);
    };

    const handleAction = async (applicationId: string, action: 'accept' | 'reject') => {
        if (!applicationId) return;
        setActionLoadingState({ id: applicationId, action });
        try {
            let res;
            if (action === 'accept') {
                res = await JobService.acceptMatch(applicationId);
            } else {
                res = await JobService.rejectMatch(applicationId);
            }
            if (res.success) {
                Toast.show({ type: 'success', text2: res.message || `Match ${action}ed successfully!` });
                fetchMatches(1, true, false); // Refresh list silently
            } else {
                Toast.show({ type: 'error', text2: res.message || `Failed to ${action} match` });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text2: error.message || `An error occurred while ${action}ing` });
        } finally {
            setActionLoadingState(null);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (isFirstMount.current) {
                fetchMatches(1, false);
                isFirstMount.current = false;
            } else {
                fetchMatches(1, true, false);
            }
            return () => {
                if (tabDebounceTimer.current) clearTimeout(tabDebounceTimer.current);
            };
        }, [fetchMatches])
    );

    const renderSkeleton = () => (
        <View style={styles.listContent}>
            {[1, 2, 3, 4].map((_, i) => (
                <JobMatchSkeleton key={i} />
            ))}
        </View>
    );

    const renderCard = ({ item }: { item: any }) => {
        const isPending = selectedTab === t.pending;
        return (
            <JobMatchCard
                item={item}
                isPending={isPending}
                t={t}
                navigation={navigation}
                handleAction={handleAction}
                actionLoadingState={actionLoadingState}
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={t.title} onBack={() => navigation.goBack()} />

            <View style={styles.toggleContainer}>
                <ToggleSwitch
                    options={[t.pending, t.confirmed]}
                    onSelect={handleTabChange}
                    initialOption={selectedTab}
                    wrapperStyle={styles.toggleWrapper}
                    sliderStyle={styles.toggleSlider}
                    textStyle={styles.toggleText}
                    activeTextStyle={styles.toggleActiveText}
                />
            </View>

            {loading && !refreshing ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.applicationId || Math.random().toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMatches(1, true, true)}
                            colors={[colors.primary]}
                        />
                    }
                    onEndReached={() => {
                        if (!loading && !isMoreLoading && hasMore) {
                            fetchMatches(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={<ListFooter isMoreLoading={isMoreLoading} />}
                    ListEmptyComponent={<EmptyView selectedTab={selectedTab} t={t} />}
                />
            )}
        </View>
    );
};

export default JobMatchesScreen;
