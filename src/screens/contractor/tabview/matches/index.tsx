import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    FlatList,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';

import styles from './styles';
import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import EmptyState from '@components/EmptyState';
import SkeletonFrame from '@components/SkeletonFrame';
import NegotiateRateModal from '@components/NegotiateRateModal';
import strings from '@constants/strings';
import colors from '@styles/colors';
import { horizontalScale, verticalScale } from '@styles/mixins';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import JobCard from './components/JobCard';
import { devDebugger } from '@utils/devDebugger';

const MatchesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const s = strings.auth.contractor.matches;

    // State
    const [activeTab, setActiveTab] = useState(s.pending);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    // Refs
    const limit = 10;
    const isFetchingRef = useRef(false);
    const tabDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tabRef = useRef(activeTab);

    const fetchMatches = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = false, showSpinner: boolean = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (pageNum === 1 && !shouldRefresh) {
            setIsLoading(true);
        } else if (shouldRefresh) {
            if (showSpinner) {
                setIsRefreshing(true);
            }
        } else {
            setIsFetchingMore(true);
        }

        try {
            const isPending = tabRef.current === s.pending;
            const res = isPending
                ? await ContractorService.getPendingMatches(pageNum, limit)
                : await ContractorService.getConfirmedMatches(pageNum, limit);

            if (res.success && res.data?.data) {
                const newMatches = res.data.data;
                if (pageNum === 1) {
                    setMatches(newMatches);
                } else {
                    setMatches((prev) => [...prev, ...newMatches]);
                }
                setHasMore(newMatches.length === limit);
                setPage(pageNum);
            } else {
                if (pageNum === 1) setMatches([]);
                setHasMore(false);
            }
        } catch (error: any) {
            devDebugger.error('Error fetching contractor matches:', error);
            Toast.show({
                type: 'error',
                text2: error.message || 'An unexpected error occurred'
            });
            if (pageNum === 1) setMatches([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsFetchingMore(false);
            isFetchingRef.current = false;
        }
    }, [s.pending]);

    // Initial Fetch
    useEffect(() => {
        fetchMatches(1, false);
    }, [fetchMatches]);

    // Tab Change with Debounce
    const handleTabChange = (val: string) => {
        setActiveTab(val);
        tabRef.current = val;

        if (tabDebounceTimer.current) {
            clearTimeout(tabDebounceTimer.current);
        }

        setIsLoading(true);
        setMatches([]);

        tabDebounceTimer.current = setTimeout(() => {
            fetchMatches(1, false);
        }, 500);
    };

    const handleRefresh = () => {
        fetchMatches(1, true, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && !isFetchingMore && hasMore && matches.length > 0) {
            fetchMatches(page + 1, false);
        }
    };

    // Skeleton Component
    const renderSkeleton = () => (
        <View style={{ paddingHorizontal: horizontalScale(20), paddingTop: verticalScale(10) }}>
            {[1, 2, 3].map((key) => (
                <View key={key} style={[styles.card, { padding: horizontalScale(15), marginBottom: verticalScale(15) }]}>
                    <View style={styles.cardHeader}>
                        <SkeletonFrame width={150} height={20} borderRadius={4} />
                        <SkeletonFrame width={80} height={24} borderRadius={12} />
                    </View>
                    <SkeletonFrame width={120} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                    <SkeletonFrame width={60} height={16} borderRadius={4} style={{ marginTop: 12, marginBottom: 15 }} />
                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}><SkeletonFrame width={100} height={14} borderRadius={4} /></View>
                            <View style={styles.infoItem}><SkeletonFrame width={100} height={14} borderRadius={4} /></View>
                        </View>
                        <View style={styles.infoRow}>
                            <SkeletonFrame width={120} height={14} borderRadius={4} />
                        </View>
                        <View style={styles.infoRow}>
                            <SkeletonFrame width={200} height={14} borderRadius={4} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const handleAccept = async () => {
        const id = selectedJob?.matchId || selectedJob?.id || selectedJob?.applicationId;
        if (!id) return;
        setIsAccepting(true);
        try {
            const res = await ContractorService.acceptMatch(id);
            if (res.success || res.statusCode === 200) {
                setShowModal(false);
                fetchMatches(1, true, false); // Refresh list silently
                Toast.showSuccess('Job accepted successfully');
            } else {
                setShowModal(false);
                Toast.showError(res.message || 'Failed to accept job');
            }
        } catch (error: any) {
            devDebugger.error('Accept match error:', error);
            setShowModal(false);
            Toast.showError(error?.message || 'An error occurred while accepting');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        const id = selectedJob?.matchId || selectedJob?.id || selectedJob?.applicationId;
        if (!id) return;
        setIsRejecting(true);
        try {
            const res = await ContractorService.rejectMatch(id);
            if (res.success || res.statusCode === 200) {
                setShowModal(false);
                fetchMatches(1, true, false); // Refresh list silently
                Toast.showSuccess('Job rejected successfully');
            } else {
                setShowModal(false);
                Toast.showError(res.message || 'Failed to reject job');
            }
        } catch (error: any) {
            devDebugger.error('Reject match error:', error);
            setShowModal(false);
            Toast.showError(error?.message || 'An error occurred while rejecting');
        } finally {
            setIsRejecting(false);
        }
    };

    const handleNegotiate = (item: any) => {
        setSelectedJob(item);
        setShowModal(true);
    };

    const renderFooter = () => {
        if (!isFetchingMore) return <View style={{ height: verticalScale(20) }} />;
        return (
            <View style={{ paddingVertical: verticalScale(20), alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader title={s.screenTitle} hideBackButton />
            
            <View style={styles.switchContainer}>
                <ToggleSwitch
                    options={[s.pending, s.confirmed]}
                    onSelect={handleTabChange}
                    containerStyle={styles.toggleWrapper}
                    sliderStyle={styles.toggleSlider}
                    textStyle={styles.toggleText}
                    activeTextStyle={styles.toggleActiveText}
                    initialOption={activeTab}
                />
            </View>

            <View style={styles.container}>
                {isLoading ? (
                    renderSkeleton()
                ) : matches.length === 0 ? (
                    <EmptyState
                    imageSource={require('@assets/images/common/noData.png')}
                        title={s.noMatchesTitle(activeTab)}
                        description={s.noMatchesDesc(activeTab)}
                    />
                ) : (
                    <FlatList
                        data={matches}
                        renderItem={({ item }) => (
                            <JobCard
                                item={item}
                                activeTab={activeTab}
                                onPress={() => navigation.navigate('MatchesDetails', { jobData: item })}
                                onNegotiate={handleNegotiate}
                            />
                        )}
                        keyExtractor={(item, index) => item.applicationId || item.matchId || item.id || String(index)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                colors={[colors.primary]}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                )}
            </View>

            <NegotiateRateModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                jobTitle={selectedJob?.title || selectedJob?.jobTitle || ''}
                originalOffer={String(selectedJob?.hourlyRate || selectedJob?.rate || '0')}
                proposedRate={String(selectedJob?.proposedRate || '0')}
                clientRate={String(selectedJob?.counterOfferRate || selectedJob?.hourlyRate || '0')}
                onReject={handleReject}
                onAccept={handleAccept}
                isRejecting={isRejecting}
                isAccepting={isAccepting}
            />
        </View>
    );
};

export default MatchesScreen;
