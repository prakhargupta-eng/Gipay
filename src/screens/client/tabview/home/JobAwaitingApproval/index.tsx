import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    TextInput,
    FlatList,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import strings from '@constants/strings';
import styles from './styles';
import AdjustHoursPopup from './components/AdjustHoursPopup';
import JobAwaitingApprovalCard from './components/JobAwaitingApprovalCard';
import TopHeader from '@components/TopHeader';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import colors from '@styles/colors';
import AppText from '@components/AppText';
import SkeletonFrame from '@components/SkeletonFrame';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

const searchIcon = require('@assets/images/common/searchIcon.png');
const emptyJobIcon = require('@assets/images/common/emptyJob.png'); // Optional if they have one

const SkeletonCard = () => (
    <View style={[styles.card, { padding: 15, marginBottom: 15, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonFrame width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
                <SkeletonFrame width="70%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonFrame width="40%" height={12} />
            </View>
        </View>
        <View style={{ marginTop: 15 }}>
            <SkeletonFrame width="100%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonFrame width="80%" height={14} style={{ marginBottom: 8 }} />
        </View>
    </View>
);

const JobAwaitingApprovalScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientAppStackParamList>>();
    const t = strings.client.jobAwaitingApproval;
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdjustVisible, setIsAdjustVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [completingIds, setCompletingIds] = useState<string[]>([]);
    const [adjustingHours, setAdjustingHours] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const isFetchingRef = useRef(false);
    const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queueRef = useRef<any[]>([]);
    const isProcessingRef = useRef(false);
    const isMounted = useRef(true);

    const fetchJobs = useCallback(async (pageNum: number = 1, isRefresh: boolean = false, search: string = '') => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            if (isRefresh) {
                setRefreshing(true);
            } else if (pageNum > 1) {
                setIsMoreLoading(true);
            } else {
                setLoading(true);
            }

            const limit = 10;
            const response = await JobService.getJobsAwaitingApproval(pageNum, limit, search);

            if (response.success && response.data) {
                const newJobs = response.data.results?.data || response.data.data || response.data.results || [];
                const pagination = response.data.results?.pagination || response.data.pagination;

                if (pageNum === 1) {
                    setJobs(newJobs);
                } else {
                    setJobs(prev => [...prev, ...newJobs]);
                }

                setPage(pageNum);
                if (pagination) {
                    setHasMore(pageNum < pagination.totalPages);
                } else {
                    setHasMore(newJobs.length === limit);
                }
            } else {
                if (pageNum === 1) setJobs([]);
                setHasMore(false);
            }
        } catch (error: any) {
            devDebugger.error('Error fetching jobs awaiting approval:', error);
            Toast.show({
                type: 'error',
                text2: error.message || t.unexpectedError
            });
            if (pageNum === 1) setJobs([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchJobs(1, false, searchQuery.length >= 3 ? searchQuery : '');
            return () => {
                if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
            };
        }, [fetchJobs])
    );

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            queueRef.current = []; // Clear queue on unmount
        };
    }, []);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        // Only search if length >= 3 or if it was cleared
        if (text.length >= 3 || text.length === 0) {
            searchDebounceTimer.current = setTimeout(() => {
                fetchJobs(1, false, text);
            }, 600);
        }
    };

    const handleLoadMore = () => {
        if (!loading && !isMoreLoading && hasMore) {
            fetchJobs(page + 1, false, searchQuery.length >= 3 ? searchQuery : '');
        }
    };

    const processQueue = async () => {
        if (isProcessingRef.current || queueRef.current.length === 0) return;
        isProcessingRef.current = true;

        while (queueRef.current.length > 0 && isMounted.current) {
            const item = queueRef.current.shift();
            if (!item) continue;

            const attendanceId = item.attendanceId || item._id || item.id;
            const jobId = item.jobId;
            const contractorId = item.contractorId || item.contractor?._id;

            try {
                const res = await JobService.markAwaitingApprovalComplete(jobId, contractorId, attendanceId);
                if (!isMounted.current) break; // Check again if unmounted during API call

                if (res.success) {
                    Toast.show({ type: 'success', text2: res.message || t.markCompleteSuccess });
                    setJobs(prevJobs => prevJobs.filter(j => 
                        (j.attendanceId || j._id || j.id) !== attendanceId
                    ));
                } else {
                    Toast.show({ type: 'error', text2: res.message || t.markCompleteFailed });
                    // Stop processing and cancel remaining queue on server error
                    queueRef.current = [];
                    setCompletingIds([]);
                    break;
                }
            } catch (error: any) {
                if (isMounted.current) {
                    Toast.show({ type: 'error', text2: error.message || t.errorOccurred });
                    // Stop processing and cancel remaining queue on network/server error
                    queueRef.current = [];
                    setCompletingIds([]);
                }
                break;
            } finally {
                if (isMounted.current) {
                    setCompletingIds(prev => prev.filter(id => id !== attendanceId));
                }
            }
        }
        
        isProcessingRef.current = false;
    };

    const handleMarkComplete = (item: any) => {
        const attendanceId = item.attendanceId || item._id || item.id;
        if (!attendanceId) return;

        setCompletingIds(prev => [...prev, attendanceId]);
        queueRef.current.push(item);
        processQueue();
    };

    const handleAdjustHoursSubmit = async (hours: string) => {
        Keyboard.dismiss();
        if (!selectedJob) return;
        const attendanceId = selectedJob.attendanceId || selectedJob._id || selectedJob.id;
        const jobId = selectedJob.jobId || selectedJob._id || selectedJob.id;
        const contractorId = selectedJob.contractorId || selectedJob.contractor?._id;
        if (!jobId || !contractorId) return;

        setAdjustingHours(true);
        try {
            const res = await JobService.adjustAwaitingApprovalHours(jobId, contractorId, attendanceId, { clientApprovedHours: Number(hours) });
            if (res.success) {
                Keyboard.dismiss();
                Toast.show({ type: 'success', text2: res.message || t.hoursAdjustedSuccess });
                setIsAdjustVisible(false);
                setSelectedJob(null);
                setJobs(prevJobs => prevJobs.map(j => 
                    ((j.attendanceId || j._id || j.id) === attendanceId) 
                        ? { ...j, isAdjustHours: false } 
                        : j
                ));
            } else {
                Toast.show({ type: 'error', text2: res.message || t.hoursAdjustFailed });
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text2: error.message || t.errorOccurred });
        } finally {
            setAdjustingHours(false);
        }
    };

    const renderCard = ({ item }: { item: any }) => {
        const isSelected = false; // Set to true to match design if needed
        const attendanceId = item.attendanceId || item._id || item.id;

        return (
            <JobAwaitingApprovalCard
                item={item}
                isSelected={isSelected}
                onPress={() => navigation.navigate('JobAwaitingApprovalDetails', { jobData: item })}
                onAdjustHours={() => {
                    setSelectedJob(item);
                    setIsAdjustVisible(true);
                }}
                onComplete={() => handleMarkComplete(item)}
                isCompleting={completingIds.includes(attendanceId)}
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <TopHeader title={t.title} onBack={() => navigation.goBack()} />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.searchContainer}>
                    <Image source={searchIcon} style={styles.searchIcon} />
                    <TextInput allowFontScaling={false} style={styles.searchInput}
                        returnKeyType="done"
                        placeholder={t.searchPlaceholder}
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                    />
                </View>
            </TouchableWithoutFeedback>

            {loading && !refreshing ? (
                <View style={styles.listContent}>
                    {[1, 2, 3, 4].map(key => <SkeletonCard key={key} />)}
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={item => item.attendanceId || Math.random().toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchJobs(1, true, searchQuery.length >= 3 ? searchQuery : '')}
                            colors={[colors.primary]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (
                        <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
                            {isMoreLoading && <ActivityIndicator size="large" color={colors.primary} />}
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                            <EmptyState
                                imageSource={require('@assets/images/common/noData.png')}
                                title={t.noJobsAwaitingApproval}
                                description={t.noJobsAwaitingApprovalDesc}
                            />
                        </View>
                    )}
                />
            )}
            <AdjustHoursPopup
                visible={isAdjustVisible}
                onClose={() => {
                    Keyboard.dismiss();
                    setIsAdjustVisible(false);
                    setSelectedJob(null);
                }}
                onSubmit={handleAdjustHoursSubmit}
                isLoading={adjustingHours}
                contractorHours={selectedJob ? String(selectedJob.actualWorkingHours  ?? selectedJob.workedHours ?? 0) : '0'}
            />
        </View>
    );
};

export default JobAwaitingApprovalScreen;
