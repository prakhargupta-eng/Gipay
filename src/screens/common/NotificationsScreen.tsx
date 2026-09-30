import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, StatusBar, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import TopHeader from '@components/TopHeader';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';
import Colors from '@styles/colors';
import AppText from '@components/AppText';
import SkeletonFrame from '@components/SkeletonFrame';
import NotificationService from '@config/notificationService';
import { Toast } from '@utils/ToastManager';
import { getLocalDateTime } from '@utils/dateUtils';
import { useSystemStore } from '@store/useSystemStore';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import KycRejectedPopup from '@components/KycRejectedPopup';
import { handleNotificationAction, hasRedirectionAction } from '@utils/notificationUtils';
import { devDebugger } from '@utils/devDebugger';

const notificationEmpty = require('@assets/images/common/notificationEmpty.png');
const bellIcon = require('@assets/images/common/bell.png');
const chevronRight = require('@assets/images/common/backIcon.png');


const ListFooterView = ({ isMoreLoading }: { isMoreLoading: boolean }) => (
    <View style={styles.listFooter}>
        {isMoreLoading && <ActivityIndicator size="large" color={Colors.primary} />}
    </View>
)


const NotificationSkeleton = () => (
    <View style={styles.notificationItem}>
        <SkeletonFrame width={horizontalScale(48)} height={horizontalScale(48)} borderRadius={horizontalScale(16)} style={{ marginRight: horizontalScale(12) }} />
        <View style={styles.textContainer}>
            <SkeletonFrame width="80%" height={verticalScale(16)} style={{ marginBottom: verticalScale(6) }} />
            <SkeletonFrame width="100%" height={verticalScale(14)} style={{ marginBottom: verticalScale(4) }} />
            <SkeletonFrame width="60%" height={verticalScale(14)} style={{ marginBottom: verticalScale(8) }} />
            <SkeletonFrame width="40%" height={verticalScale(12)} />
        </View>
    </View>
);

const NotificationsScreen = ({ navigation }: any) => {
    const { userId, userType } = useAuth();
    const { unreadCount, fetchUnreadCount } = useSystemStore();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isKycPopupVisible, setIsKycPopupVisible] = useState(false);

    const handleNotificationPress = async (item: any) => {
        // 1. Hit API to mark read, and update local state ONLY on success
        if (!item.isRead) {
            const notifId = item.id || item._id;
            if (notifId) {
                NotificationService.markRead(notifId).then(res => {
                    if (res.success) {
                        setNotifications(prev => prev.map(n => {
                            const nId = n.id || n._id;
                            return (nId === notifId) ? { ...n, isRead: true } : n;
                        }));
                        
                        const currentCount = useSystemStore.getState().unreadCount;
                        if (currentCount > 0) {
                            useSystemStore.getState().setUnreadCount(currentCount - 1);
                        }
                    }
                }).catch(err => devDebugger.log('Mark read error:', err));
            }
        }

        // 2. Delegate to the global notification helper
        handleNotificationAction(item, userId, userType, () => {
            setIsKycPopupVisible(true);
        });
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await NotificationService.markAllRead();
            if (res.success) {
                // Update local state to set all notifications as read
                setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
                // Reset the bell/unread count to zero in global store
                useSystemStore.getState().setUnreadCount(0);
                Toast.show({ type: 'success', text2: strings.notifications.markAllReadSuccess });
            } else {
                Toast.show({ type: 'error', text2: res.message || strings.notifications.markAllReadFailed });
            }
        } catch (error: any) {
            devDebugger.error('Error marking all notifications as read:', error);
            Toast.show({ type: 'error', text2: error.message || strings.notifications.markAllReadFailed });
        }
    };

    const isNotificationRead = (item: any): boolean => {
        if (!item) return true;
        return Boolean(
            item.isRead === true ||
            item.isRead === 1 ||
            item.isRead === 'true' ||
            item.read === true ||
            item.read === 1 ||
            item.read === 'true' ||
            item.is_read === true ||
            item.is_read === 1 ||
            item.is_read === 'true' ||
            item.readAt ||
            item.status === 'read' ||
            item.status === 'READ'
        );
    };

    const hasUnread = notifications.length > 0 && 
        unreadCount !== 0 && 
        (unreadCount > 0 || notifications.some(item => !isNotificationRead(item)));

    const rightComponent = hasUnread ? (
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <AppText style={{ fontSize: fontSize(13), fontFamily: fonts.semiBold, color: Colors.primary }}>
                {strings.notifications.readAll}
            </AppText>
        </TouchableOpacity>
    ) : undefined;

    const fetchNotifications = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (pageNum > 1) {
                setIsMoreLoading(true);
            } else {
                setLoading(true);
            }

            const limit = 10;
            const res = await NotificationService.getNotifications({
                page: pageNum,
                limit,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            if (res.success && res.data) {
                const rawNotifications = res.data?.results?.data || res.data?.data || res.data?.results || [];
                const newNotifications = rawNotifications.map((item: any) => ({
                    ...item,
                    isRead: isNotificationRead(item),
                }));
                const pagination = res.data?.results?.pagination || res.data?.pagination;

                if (pageNum === 1) {
                    setNotifications(newNotifications);
                } else {
                    setNotifications(prev => {
                        const existingIds = new Set(prev.map(n => n.id || n._id));
                        const uniqueNew = newNotifications.filter((n: any) => !existingIds.has(n.id || n._id));
                        return [...prev, ...uniqueNew];
                    });
                }

                setPage(pageNum);
                if (pagination) {
                    setHasMore(pageNum < pagination.totalPages);
                } else {
                    setHasMore(newNotifications.length === limit);
                }
            } else {
                if (pageNum === 1) setNotifications([]);
                setHasMore(false);
            }
        } catch (error: any) {
            devDebugger.error('Error fetching notifications:', error);
            Toast.show({ type: 'error', text2: error.message || 'Failed to load notifications' });
            if (pageNum === 1) setNotifications([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1, false);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    const handleRefresh = () => {
        fetchNotifications(1, true);
        fetchUnreadCount();
    };

    const handleLoadMore = () => {
        if (!loading && !isMoreLoading && hasMore) {
            fetchNotifications(page + 1, false);
        }
    };



    const renderItem = ({ item }: { item: any }) => {
        const hasRedirection = hasRedirectionAction(item.type, userType);
        return (
            <TouchableOpacity 
                style={[styles.notificationItem, !item.isRead && styles.unreadItem]} 
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={styles.iconWrapper}>
                    <View style={styles.iconContainer}>
                        <Image source={bellIcon} style={styles.icon} resizeMode="contain" />
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <View style={styles.textContainer}>
                    <View style={[styles.titleRow, hasRedirection && { marginRight: horizontalScale(20) }]}>
                        <AppText style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</AppText>
                    </View>
                    <AppText style={[styles.itemMessage, hasRedirection && { marginRight: horizontalScale(20) }]}>{item.description}</AppText>
                    <AppText style={styles.itemDate}>
                        {`${getLocalDateTime(item.createdAt || item.date).date} ${getLocalDateTime(item.createdAt || item.date).time}`}
                    </AppText>
                </View>
                {hasRedirection && (
                    <View style={styles.chevronWrapper}>
                        <Image source={chevronRight} style={styles.chevronIcon} resizeMode="contain" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
            <TopHeader
                title={strings.notifications.screenTitle}
                onBack={() => navigation.goBack()}
                rightComponent={rightComponent}
            />

            {loading && !refreshing ? (
                <View style={styles.listContainer}>
                    {[1, 2, 3, 4, 5].map((key) => <NotificationSkeleton key={key} />)}
                </View>
            ) : notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => item.id || item._id || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[Colors.primary]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={ListFooterView({ isMoreLoading })}
                />
            ) : (
                <View style={styles.emptyContent}>
                    <Image
                        source={notificationEmpty}
                        style={styles.emptyImage}
                        resizeMode="contain"
                    />
                    <AppText style={styles.emptyTitle}>{strings.notifications.emptyTitle}</AppText>
                    <AppText style={styles.emptySubtitle}>
                        {strings.notifications.emptySubtitle}
                    </AppText>
                </View>
            )}
            <KycRejectedPopup
                visible={isKycPopupVisible}
                onClose={() => setIsKycPopupVisible(false)}
                onReKyc={() => {
                    setIsKycPopupVisible(false);
                    navigation.navigate('ReKyc');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    listFooter: {
        height: verticalScale(60),
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(30),
        paddingBottom: verticalScale(100),
    },
    emptyImage: {
        width: horizontalScale(200),
        height: horizontalScale(200),
        marginBottom: verticalScale(20),
    },
    emptyTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize(20),
        color: '#1E1B4B',
        marginBottom: verticalScale(10),
    },
    emptySubtitle: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: fontSize(20),
    },
    listContainer: {
        paddingHorizontal: horizontalScale(15),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(20),
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: horizontalScale(14),
        marginBottom: verticalScale(12),
        backgroundColor: '#F5F6F8',
        borderRadius: horizontalScale(16),
        borderWidth: 1,
        borderColor: '#EAECEF',
    },
    unreadItem: {
        backgroundColor: '#F5F6F8',
        borderColor: '#EAECEF',
    },
    iconWrapper: {
        position: 'relative',
        marginRight: horizontalScale(12),
    },
    iconContainer: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(22),
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        tintColor: '#475569',
    },
    unreadDot: {
        position: 'absolute',
        top: horizontalScale(1),
        right: horizontalScale(1),
        width: horizontalScale(10),
        height: horizontalScale(10),
        borderRadius: horizontalScale(5),
        backgroundColor: '#0EA5E9',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(2),
    },
    itemTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize(15),
        color: '#1E293B',
        flex: 1,
        marginRight: horizontalScale(8),
    },
    itemMessage: {
        fontFamily: fonts.regular,
        fontSize: fontSize(13),
        color: '#475569',
        lineHeight: fontSize(18),
    },
    itemDate: {
        fontFamily: fonts.medium,
        fontSize: fontSize(12),
        color: '#64748B',
        marginTop: verticalScale(4),
        alignSelf: 'flex-end',
    },
    chevronWrapper: {
        position: 'absolute',
        right: horizontalScale(14),
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scaleX: -1 }],
        zIndex: 1,
    },
    chevronIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        tintColor: '#94A3B8',
    },
});

export default NotificationsScreen;
