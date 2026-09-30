import React from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import SegmentedControl from '@components/SegmentedControl';
import colors from '@styles/colors';
import strings from '@constants/strings';
import ClockOutPopup from './ClockOutPopup';
import ClockOutCardSkeleton from './ClockOutCardSkeleton';
import {
    useClockOutViewModel,
    ClockOutDisplayItem,
    ClockOutTab,
} from './useClockOutViewModel';
import styles from './styles';

const ClockOutRequestScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        activeTab,
        setActiveTab,
        filteredJobs,
        emptyStateInfo,
        isLoading,
        isRefreshing,
        isLoadingMore,
        handleRefresh,
        handleLoadMore,
        selectedJob,
        isPopupVisible,
        handleClockOutPress,
        handlePopupClose,
        handlePopupSubmitSuccess,
    } = useClockOutViewModel();

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderJobItem = ({ item }: { item: ClockOutDisplayItem }) => {
        return (
            <View style={styles.jobCard}>
                {/* Header: Title and Status Badge */}
                <View style={styles.cardHeader}>
                    <AppText style={styles.jobTitle} numberOfLines={2}>
                        {item.title}
                    </AppText>
                    <View style={[styles.statusBadge, item.statusBadgeStyle]}>
                        <AppText style={[styles.statusText, item.statusTextStyle]} numberOfLines={1}>
                            {item.statusLabel}
                        </AppText>
                    </View>
                </View>

                {/* Subtitle / Company */}
                {!!item.company && <AppText style={styles.companyName}>{item.company}</AppText>}

                {/* Date & Time */}
                {(!!item.dateDisplay || !!item.timeDisplay) && (
                    <View style={styles.dateRow}>
                        {!!item.dateDisplay && (
                            <View style={styles.dateItem}>
                                <Image
                                    source={require('@assets/images/common/calanderGray.png')}
                                    style={styles.iconSmall}
                                    resizeMode="contain"
                                />
                                <AppText style={styles.infoText}>{item.dateDisplay}</AppText>
                            </View>
                        )}
                        {!!item.timeDisplay && (
                            <View style={styles.timeItem}>
                                <Image
                                    source={require('@assets/images/common/clockGray.png')}
                                    style={styles.iconSmall}
                                    resizeMode="contain"
                                />
                                <AppText style={styles.infoText}>{item.timeDisplay}</AppText>
                            </View>
                        )}
                    </View>
                )}

                {/* Rates */}
                {(!!item.jobRate || !!item.proposedRate) && (
                    <View style={styles.infoRow}>
                        <Image
                            source={require('@assets/images/common/doller.png')}
                            style={styles.iconSmall}
                            resizeMode="contain"
                        />
                        <View style={styles.ratesContainer}>
                            {!!item.jobRate && (
                                <AppText
                                    style={[
                                        styles.infoText,
                                        item.proposedRate ? styles.strikethroughText : undefined,
                                    ]}
                                >
                                    {strings.clockOutRequest.jobRateLabel}
                                    {item.jobRate}
                                </AppText>
                            )}
                            {!!item.proposedRate && (
                                <AppText style={[styles.infoText, styles.proposedRateText]}>
                                    {strings.clockOutRequest.proposedRateLabel}
                                    {item.proposedRate}
                                </AppText>
                            )}
                        </View>
                    </View>
                )}

                {/* Location */}
                {!!item.address && (
                    <View style={styles.infoRow}>
                        <Image
                            source={require('@assets/images/common/locationPin.png')}
                            style={styles.iconSmall}
                            resizeMode="contain"
                        />
                        <AppText style={styles.infoText}>{item.address}</AppText>
                    </View>
                )}

                {/* Reason - Shown for requests that have reason */}
                {!!item.reason && (
                    <View style={styles.reasonRow}>
                        <AppText style={styles.reasonLabel}>{strings.clockOutRequest.submittedReasonLabel}</AppText>
                        <AppText style={styles.reasonText}>{item.reason}</AppText>
                    </View>
                )}

                {/* Rejection Reason - Shown for rejected requests */}
                {!!item.rejectionReason && (
                    <View style={styles.rejectionReasonRow}>
                        <AppText style={styles.rejectionReasonLabel}>{strings.clockOutRequest.rejectionReasonLabel}</AppText>
                        <AppText style={styles.reasonText}>{item.rejectionReason}</AppText>
                    </View>
                )}

                {/* Action Button: Clock Out - ONLY shown on Pending tab for shifts needing clock out */}
                {item.isPending && (
                    <TouchableOpacity
                        style={styles.clockOutBtn}
                        onPress={() => handleClockOutPress(item)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={require('@assets/images/common/blackClock.png')}
                            style={styles.clockOutIcon}
                            resizeMode="contain"
                        />
                        <AppText style={styles.clockOutText}>
                            {strings.clockOutRequest.clockOut}
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />

            {/* Top Header */}
            <TopHeader
                title={strings.clockOutRequest.screenTitle}
                onBack={() => navigation.goBack()}
            />

            {/* 3 Status Tabs: Pending, Requested, Completed */}
            <View style={styles.tabsContainer}>
                <SegmentedControl
                    options={['Pending', 'Requested', 'Completed']}
                    initialOption={activeTab}
                    onSelect={(val) => setActiveTab(val as ClockOutTab)}
                />
            </View>

            {/* Jobs List / Skeletons */}
            {isLoading ? (
                <ClockOutCardSkeleton count={3} showButton={activeTab === 'Pending'} />
            ) : (
                <FlatList
                    data={filteredJobs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            imageSource={require('@assets/images/common/noData.png')}
                            title={emptyStateInfo.title}
                            description={emptyStateInfo.description}
                        />
                    }
                />
            )}

            {/* Clock Out Request Popup Modal */}
            <ClockOutPopup
                visible={isPopupVisible}
                job={selectedJob}
                onClose={handlePopupClose}
                onSubmitSuccess={handlePopupSubmitSuccess}
            />
        </View>
    );
};

export default ClockOutRequestScreen;
