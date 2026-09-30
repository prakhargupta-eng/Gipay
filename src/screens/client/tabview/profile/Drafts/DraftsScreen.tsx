import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    StatusBar,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import TopHeader from '@components/TopHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import DatePicker from 'react-native-date-picker';
import AuthService from '@config/authService';
import SkeletonFrame from '@components/SkeletonFrame';
import { horizontalScale, verticalScale } from '@styles/mixins';
import colors from '@colors';
import InputField from '@components/InputField';
import ConfirmationPopup from '@components/ConfirmationPopup';
import { Toast } from '@utils/ToastManager';
import EmptyState from '@components/EmptyState';
import styles from './styles';

import strings from '@strings';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ClientAppStackParamList, 'Drafts'>;

interface DraftJob {
    id: string;
    _id?: string;
    jobTitle: string;
    createdAt: string;
    location?: string;
    hourlyRate?: number;
    [key: string]: any;
}

const DraftsScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
    const [isToPickerOpen, setIsToPickerOpen] = useState(false);

    // API State
    const [drafts, setDrafts] = useState<DraftJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Delete State
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState<DraftJob | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filterState = useRef({ searchQuery, fromDate, toDate });
    filterState.current = { searchQuery, fromDate, toDate };

    const fetchDrafts = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            }

            if (pageNum === 1) {
                setPage(1);
                if (!isRefresh) {
                    setLoading(true);
                }
            } else {
                setLoadingMore(true);
            }

            const { searchQuery: q, fromDate: f, toDate: t } = filterState.current;
            const startStr = f ? f.toISOString().split('T')[0] : undefined;
            const endStr = t ? t.toISOString().split('T')[0] : undefined;
            const searchParam = q.length >= 3 ? q : undefined;

            const response = await AuthService.getDraftJobs(pageNum, 10, searchParam, startStr, endStr);

            if (response.success) {
                const newData = response.data.data || [];
                if (pageNum === 1) {
                    setDrafts(newData);
                } else {
                    setDrafts(prev => [...prev, ...newData]);
                }

                // Assuming pagination info is available
                setHasNextPage(response.data.pagination?.hasNextPage || newData.length === 10);
            }
        } catch (error) {
            devDebugger.error('Error fetching drafts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDrafts(1, false);
        }, [fetchDrafts])
    );

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (searchQuery.length >= 3 || searchQuery.length === 0) {
                fetchDrafts(1, false);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [searchQuery, fromDate, toDate, fetchDrafts]);

    const handleRefresh = () => {
        setPage(1);
        fetchDrafts(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasNextPage) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchDrafts(nextPage);
        }
    };

    const displayDrafts = drafts;

    const handleDeleteDraft = (item: DraftJob) => {
        setSelectedDraft(item);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        if (!selectedDraft) return;

        const id = selectedDraft._id || selectedDraft.id;
        setIsDeleting(true);

        try {
            const response = await AuthService.deleteDraftJob(id);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Draft deleted successfully'
                });
                fetchDrafts(1, false); // Refresh list
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.message || 'Failed to delete draft'
                });
            }
        } catch (error: any) {
            devDebugger.error('Error deleting draft:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'An unexpected error occurred'
            });
        } finally {
            setIsDeleting(false);
            setShowDeletePopup(false);
            setSelectedDraft(null);
        }
    };



    const renderDraftItem = ({ item }: { item: DraftJob }) => (
        <TouchableOpacity
            style={styles.draftCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreateJob', { draftData: item, isEditing: true, isCommingfromDraft: true })}
        >
            <View style={styles.cardContent}>
                <View style={styles.jobInfo}>
                    <AppText style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</AppText>
                    <View style={styles.savedOnRow}>
                        <Image source={require('@assets/images/common/calanderGray.png')} style={styles.savedOnIcon} />
                        <AppText style={styles.dateLabel}>{strings.client.drafts.savedOn(getLocalDateTime(item.createdAt).date)}</AppText>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteDraft(item)} style={styles.deleteButton}>
                    <Image
                        source={require('@assets/images/common/trashIconBlack.png')}
                        style={styles.trashIcon}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderSkeleton = () => (
        <View style={styles.draftCard}>
            <View style={styles.cardContent}>
                <View style={styles.jobInfo}>
                    <SkeletonFrame width={horizontalScale(150)} height={verticalScale(20)} style={{ marginBottom: 8 }} />
                    <SkeletonFrame width={horizontalScale(100)} height={verticalScale(14)} />
                </View>
                <SkeletonFrame width={horizontalScale(20)} height={horizontalScale(20)} borderRadius={10} />
            </View>
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <TopHeader
                title={strings.client.drafts.listTitle}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <InputField
                        placeholder={strings.client.drafts.searchPlaceholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.searchBarContainer}
                        renderLeftIcon={() => (
                            <Image
                                source={require('@assets/images/common/searchIcon.png')}
                                style={styles.searchIconInside}
                            />
                        )}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filterSection}>
                    <View style={styles.dateRow}>
                        <View style={styles.datePickerWrapper}>
                            <AppText style={styles.dateLabelTop}>{strings.client.drafts.startDate}</AppText>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setIsFromPickerOpen(true)}
                            >
                                <AppText style={[styles.dateText, !fromDate && { color: '#9CA3AF' }]}>
                                    {fromDate ? getLocalDateTime(fromDate).date : strings.client.drafts.selectDate}
                                </AppText>
                                {fromDate ? (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setFromDate(null);
                                            setToDate(null);
                                        }}
                                        style={{ padding: 4 }}
                                    >
                                        <Image
                                            source={require('@assets/images/common/closeIcon.png')}
                                            style={styles.calendarIcon}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Image
                                        source={require('@assets/images/common/calander.png')}
                                        style={styles.calendarIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.datePickerWrapper}>
                            <AppText style={styles.dateLabelTop}>{strings.client.drafts.endDate}</AppText>
                            <TouchableOpacity
                                style={[styles.datePickerButton, !fromDate && { opacity: 0.6 }]}
                                onPress={() => {
                                    if (!fromDate) {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Error',
                                            text2: 'Please select start date first'
                                        });
                                        return;
                                    }
                                    setIsToPickerOpen(true);
                                }}
                            >
                                <AppText style={[styles.dateText, !toDate && { color: '#9CA3AF' }]}>
                                    {toDate ? getLocalDateTime(toDate).date : strings.client.drafts.selectDate}
                                </AppText>
                                {toDate ? (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setToDate(null);
                                        }}
                                        style={{ padding: 4 }}
                                    >
                                        <Image
                                            source={require('@assets/images/common/closeIcon.png')}
                                            style={styles.calendarIcon}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Image
                                        source={require('@assets/images/common/calander.png')}
                                        style={styles.calendarIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Draft List */}
                {loading && page === 1 ? (
                    <FlatList
                        data={[1, 2, 3, 4, 5]}
                        renderItem={renderSkeleton}
                        keyExtractor={item => item.toString()}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <FlatList
                        data={displayDrafts}
                        renderItem={renderDraftItem}
                        keyExtractor={item => item._id || item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
                            ) : null
                        }
                        ListEmptyComponent={
                            !loading ? (
                                <EmptyState
                                    imageSource={require('@assets/images/common/noData.png')}
                                    title={strings.client.drafts.noDraftsFound}
                                    description={strings.client.drafts.noDraftsDesc}
                                />
                            ) : null
                        }
                    />
                )}
            </View>

            {/* Date Pickers */}
            <DatePicker
                modal
                open={isFromPickerOpen}
                date={fromDate || new Date()}
                mode="date"
                maximumDate={toDate || new Date()} // Start date cannot be in the future, and cannot exceed end date if set
                onConfirm={(date) => {
                    setIsFromPickerOpen(false);
                    setFromDate(date);
                    // Reset toDate if it's now before the new fromDate
                    if (toDate) {
                        const startZero = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        const endZero = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
                        if (startZero > endZero) {
                            setToDate(null);
                        }
                    }
                }}
                onCancel={() => setIsFromPickerOpen(false)}
            />
            <DatePicker
                modal
                open={isToPickerOpen}
                date={toDate || (fromDate ? new Date(fromDate) : new Date())}
                mode="date"
                minimumDate={fromDate || undefined} // End date filter must be on or after start date filter
                onConfirm={(date) => {
                    setIsToPickerOpen(false);
                    setToDate(date);
                }}
                onCancel={() => setIsToPickerOpen(false)}
            />

            <ConfirmationPopup
                visible={showDeletePopup}
                onClose={() => setShowDeletePopup(false)}
                onConfirm={confirmDelete}
                message={`Are you sure you want to delete ${selectedDraft?.jobTitle || 'this draft'}?`}
                confirmText="Yes"
                cancelText="No"
                isLoading={isDeleting}
                isDestructive={true}
            />
        </View>
    );
};

export default DraftsScreen;
