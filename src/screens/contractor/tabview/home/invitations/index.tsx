import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import styles from './styles';
import strings from '@constants/strings';
import colors from '@styles/colors';
import Fonts from '@assets/Fonts';
import TopHeader from '@components/TopHeader';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '@store/useUserStore';
import InvitationCellSkeleton from './components/InvitationCellSkeleton';
import { horizontalScale, verticalScale } from '@styles/mixins';
import CustomToast from '@components/CustomToast';
import { getStatusStyles } from '@utils/statusUtils';
import FilterModal from '@components/FilterModal';
import KycRejectedPopup from '@components/KycRejectedPopup';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import EmptyState from '@components/EmptyState';
import { useLocation } from '@hooks/useLocation';
import { devDebugger } from '@utils/devDebugger';

const HorizontalDashedLine = () => (
    <View style={{ height: 1, width: '100%', overflow: 'hidden', flexDirection: 'row' }}>
        {Array.from({ length: 100 }).map((_, i) => (
            <View key={i} style={{ width: 4, height: 1, backgroundColor: '#E0E0E0', marginRight: 4 }} />
        ))}
    </View>
);

const VerticalDashedLine = () => (
    <View style={{ width: 1, height: '100%', overflow: 'hidden', flexDirection: 'column' }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ width: 1, height: 4, backgroundColor: '#E0E0E0', marginBottom: 4 }} />
        ))}
    </View>
);

const JobInvitationsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ContractorAppStackParamList>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [respondingStatus, setRespondingStatus] = useState<'accepted' | 'rejected' | null>(null);
    const [isKycPopupVisible, setIsKycPopupVisible] = useState(false);
    const { location: userLocation, } = useLocation();
    const s = strings.auth.contractor.jobInvitations;
    const LIMIT = 10;

    const commonAssets = {
        backIcon: require('@assets/images/common/backIcon.png'),
        searchIcon: require('@assets/images/common/searchIcon.png'),
        filterIcon: require('@assets/images/common/settingIcon.png'),
        starIcon: require('@assets/images/common/star.png'),
        calendarIcon: require('@assets/images/common/calanderGray.png'),
        clockIcon: require('@assets/images/common/clockGray.png'),
        dollarIcon: require('@assets/images/common/doller.png'),
        locationIcon: require('@assets/images/common/locationPin.png'),
        declineIcon: require('@assets/images/common/cancle.png'),
        acceptIcon: require('@assets/images/common/check.png'),
    };

    const filters = [s.all, s.nearby, s.highestPay, s.mostRecent];

    useFocusEffect(
        useCallback(() => {
            handleRefresh();
        }, [])
    );

    // Debounced search effect
    useEffect(() => {
        const isSearchTooShort = searchQuery.length > 0 && searchQuery.length < 3;
        if (isSearchTooShort) return;

        const delay = searchQuery.length > 0 ? 2000 : 500;

        const timer = setTimeout(() => {
            handleRefresh();
        }, delay);
        return () => clearTimeout(timer);
    }, [searchQuery, activeFilter, startDate, endDate]);

    const fetchInvitations = async (pageNum: number, shouldRefresh: boolean = false) => {
        if (!shouldRefresh && !hasMore) return;

        if (shouldRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoadMore(true);
        }

        try {
            const response = await ContractorService.getInvitations({
                page: pageNum,
                limit: LIMIT,
                search: searchQuery,
                filter: activeFilter,
                fromDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
                toDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
                lat: userLocation?.latitude ?? undefined,
                lng: userLocation?.longitude ?? undefined,
            });

            if (response.success && response.data) {
                const results = response.data.data || response.data || [];
                const pagination = response.data.pagination;

                const newData = results.map((item: any) => {
                    // Simple date formatter
                    const formatDate = (dateStr: string) => {
                        if (!dateStr) return '';
                        const date = new Date(dateStr);
                        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                    };

                    return {
                        id: item.id || item._id,
                        invitationId: item.invitationId,
                        title: item.title || '',
                        company: item.organizationName || '',
                        status: item.invitationStatus || '',
                        rating: item.rating || '',
                        distance: item.distance || '',
                        dateRange: `${getLocalDateTime(item.startDate).date} - ${getLocalDateTime(item.endDate).date}`,
                        timeRange: `${getLocalDateTime(item.startDate).time} - ${getLocalDateTime(item.endDate).time}`,
                        rate: item.hourlyRate || '',
                        location: item.location || '',
                        description: item.description || '',
                        negotiateRate: item.negotiation?.proposedRate && item.negotiation?.proposedRate !== item.hourlyRate
                            ? item.negotiation.proposedRate
                            : (item.negotiation?.originalOffer && item.negotiation?.originalOffer !== item.hourlyRate
                                ? item.negotiation.originalOffer
                                : null),
                        negotiation: item.negotiation,
                        raw: item,
                    };
                });

                if (shouldRefresh) {
                    setInvitations(newData);
                } else {
                    setInvitations(prev => [...prev, ...newData]);
                }

                if (pagination && pagination.currentPage !== undefined && pagination.totalPages !== undefined) {
                    setHasMore(pagination.currentPage < pagination.totalPages);
                } else if (pagination && pagination.page !== undefined && pagination.pages !== undefined) {
                    setHasMore(pagination.page < pagination.pages);
                } else {
                    setHasMore(newData.length === LIMIT);
                }
                setPage(pageNum);
            } else {
                if (shouldRefresh) setInvitations([]);
                setHasMore(false);
            }
        } catch (error: any) {
            devDebugger.log('Error fetching invitations:', error);
            if (shouldRefresh) setInvitations([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadMore(false);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        setHasMore(true);
        fetchInvitations(1, true);
    };

    const handleLoadMore = () => {
        if (!isLoadMore && hasMore && !isRefreshing) {
            fetchInvitations(page + 1);
        }
    };

    const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'rejected') => {
        if (respondingId) return;

        if (status === 'accepted' && useUserStore.getState().isRestricted()) {
            setIsKycPopupVisible(true);
            return;
        }

        setRespondingId(invitationId);
        setRespondingStatus(status);

        try {
            const response = await ContractorService.respondToInvitation(invitationId, status);
            if (response.success) {
                Toast.showSuccess(`Invitation ${status} successfully`);
                // Remove the invitation from the list or update its status locally
                setInvitations(prev => prev.filter(item => item.invitationId !== invitationId));
            } else {
                Toast.showError(response.message || `Failed to ${status} invitation`);
            }
        } catch (error) {
            devDebugger.error(`Error responding to invitation:`, error);
        } finally {
            setRespondingId(null);
            setRespondingStatus(null);
        }
    };

    const renderFilterPills = () => (
        <View style={styles.categoryWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterPillsScroll}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.pill,
                            activeFilter === filter && styles.activePill
                        ]}
                        onPress={() => setActiveFilter(filter)}
                        activeOpacity={0.7}
                    >
                        <AppText style={[
                            styles.pillText,
                            activeFilter === filter && styles.activePillText
                        ]}>
                            {filter}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderJobCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('InvitationDetails', { jobData: item })}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <AppText style={styles.jobTitle} numberOfLines={1}>{item.title}</AppText>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            getStatusStyles(item.status).badge
                        ]}>
                            <AppText style={[
                                styles.statusText,
                                { fontFamily: Fonts.semiBold },
                                getStatusStyles(item.status).text
                            ]}>
                                {getStatusStyles(item.status).label}
                            </AppText>
                        </View>
                    </View>
                    <AppText style={styles.companyName}>{item.company}</AppText>

                    <View style={styles.ratingRow}>
                        {(item.rating && parseFloat(item.rating) > 0) ? (
                            <>
                                <Image source={commonAssets.starIcon} style={styles.starIcon} />
                                <AppText style={styles.ratingText}>{item.rating}{item.distance ? ` | ${item.distance}` : ''}</AppText>
                            </>
                        ) : item.distance ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={require('@assets/images/common/map.png')} style={[styles.starIcon, { tintColor: '#9CA3AF' }]} />
                                <AppText style={styles.ratingText}>{item.distance}</AppText>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Image source={commonAssets.calendarIcon} style={styles.infoIcon} />
                                <AppText style={styles.infoText}>{item.dateRange}</AppText>
                            </View>
                            <View style={[styles.infoItem, { marginLeft: verticalScale(-10) }]}>
                                <Image source={commonAssets.clockIcon} style={styles.infoIcon} />
                                <AppText style={styles.infoText}>{item.timeRange}</AppText>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Image source={commonAssets.dollarIcon} style={styles.infoIcon} />
                            <View style={styles.rateContainer}>
                                <AppText style={[
                                    styles.infoText,
                                    item.negotiateRate ? { textDecorationLine: 'line-through' } : null
                                ]}>
                                    {s.jobRate(item.rate)}
                                </AppText>
                                {item.negotiateRate && (
                                    <AppText style={styles.negotiateText}>{s.Proposed(item.negotiation.proposedRate)}</AppText>
                                )}
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Image source={commonAssets.locationIcon} style={styles.infoIcon} />
                            <AppText style={styles.infoText}>{item.location}</AppText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <HorizontalDashedLine />
            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.footerButton, styles.declineButton]}
                    activeOpacity={0.7}
                    onPress={() => handleInvitationResponse(item.invitationId, 'rejected')}
                    disabled={respondingId === item.invitationId}
                >
                    {respondingId === item.invitationId && respondingStatus === 'rejected' ? (
                        <ActivityIndicator size="small" color={colors.red} />
                    ) : (
                        <>
                            <Image source={commonAssets.declineIcon} style={styles.buttonIcon} />
                            <AppText style={[styles.buttonText, styles.declineText]}>{s.decline}</AppText>
                        </>
                    )}
                </TouchableOpacity>
                {item.negotiation?.isProposeRate === false && (
                    <>
                        <VerticalDashedLine />

                        <TouchableOpacity
                            style={[styles.footerButton, styles.acceptButton]}
                            activeOpacity={0.7}
                            onPress={() => handleInvitationResponse(item.invitationId, 'accepted')}
                            disabled={respondingId === item.invitationId}
                        >
                            {respondingId === item.invitationId && respondingStatus === 'accepted' ? (
                                <ActivityIndicator size="small" color={colors.green} />
                            ) : (
                                <>
                                    <Image source={commonAssets.acceptIcon} style={styles.acceptedDeclineIcon} />
                                    <AppText style={[styles.buttonText, styles.acceptText]}>{s.accept}</AppText>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}

            </View>
        </View>
    );

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={s.screenTitle}
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <Image source={commonAssets.searchIcon} style={styles.searchIcon} />
                    <TextInput allowFontScaling={false} style={styles.searchInput}
                        returnKeyType="done"
                        placeholder={s.searchPlaceholder}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity onPress={() => setIsFilterModalVisible(true)}>
                        <Image source={commonAssets.filterIcon} style={[styles.filterIcon, { tintColor: (startDate || endDate) ? colors.primary : colors.gray }]} />
                    </TouchableOpacity>
                </View>

                {/*Filter Pills */}
                {renderFilterPills()}

                {/* Invitations List */}
                <FlatList
                    style={{ flex: 1 }}
                    data={invitations}
                    renderItem={renderJobCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, invitations.length === 0 && { flexGrow: 1 }]}
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
                    ListFooterComponent={
                        isLoadMore ? (
                            <View style={{ paddingHorizontal: horizontalScale(20), paddingBottom: 20 }}>
                                <InvitationCellSkeleton />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        !isLoading && !isRefreshing ? (
                            <View style={{ paddingTop: verticalScale(40) }}>
                                <EmptyState
                                    imageSource={require('@assets/images/common/noData.png')}
                                    title={s.noJobInvitationsFound}
                                    description={s.noJobInvitationsDesc}
                                />
                            </View>
                        ) : (
                            <View style={{ paddingHorizontal: horizontalScale(0) }}>
                                {[1, 2, 3].map((i) => (
                                    <InvitationCellSkeleton key={i} />
                                ))}
                            </View>
                        )
                    }
                />
            </View>
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
            <KycRejectedPopup
                visible={isKycPopupVisible}
                onClose={() => setIsKycPopupVisible(false)}
                onReKyc={() => {
                    setIsKycPopupVisible(false);
                    navigation.navigate('ReKyc' as any);
                }}
            />
        </View>
    );
};

export default JobInvitationsScreen;
