import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { requestNotificationPermission, handleNotificationAction } from './notificationUtils';
import { navigationRef } from '@navigation/NavigationService';
import { RESULTS } from 'react-native-permissions';
// import { Toast } from '@utils/ToastManager';
import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';
import { useSystemStore } from '@store/useSystemStore';
import { getIsLoggedIn, getUserId, getUserType } from '@store/storage';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { useUserStore } from '@store/useUserStore';
import { NotificationType } from '@constants/enums';
import { handleSessionExpired } from '@config/apiService';
import { devDebugger } from '@utils/devDebugger';

class NotificationService {
    public initialNotificationPayload: any = null;
    private unsubscribeOnMessage?: () => void;
    private activeChatKey: string | null = null;
    private readonly chatMessageHistory = new Map<string, string[]>();

    public setActiveChatKey(key: string | null) {
        this.activeChatKey = key;
        if (key) {
            this.clearChatHistory(key);
        }
    }

    public clearChatHistory(conversationKey: string) {
        this.chatMessageHistory.delete(conversationKey);
        if (Platform.OS === 'android') {
            notifee.cancelNotification(`chat_${conversationKey}`).catch(() => { });
        }
    }

    async initialize() {
        try {
            const status = await requestNotificationPermission();

            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                const token = await this.getFcmToken();
                // Token log removed for privacy
                // Safely grab initial notification BEFORE attaching listeners to avoid race conditions
                const initialNotification = await messaging().getInitialNotification();
                if (initialNotification?.data) {
                    devDebugger.log('📬 COLD LAUNCH: Notification received');

                    this.initialNotificationPayload = initialNotification.data;
                    this.processInitialNotification(); // Try to process immediately if nav is ready
                } else {
                    const notifeeInitial = await notifee.getInitialNotification();
                    if (notifeeInitial?.notification?.data) {
                        devDebugger.log('📬 NOTIFEE COLD LAUNCH: Notification received');

                        this.initialNotificationPayload = notifeeInitial.notification.data;
                        this.processInitialNotification();
                    }
                }

                // Set up listeners
                this.createNotificationListeners();
                this.registerNotifeeHandlers();
            } else {
                devDebugger.log('Notification permission denied');
            }
        } catch (error) {
            devDebugger.error('Error initializing notifications:', error);
        }
    }

    async getFcmToken() {
        try {
            const token = await messaging().getToken();
            return token;
        } catch (error) {
            if (__DEV__) {
                devDebugger.error(`❌ Error getting FCM token [${Platform.OS.toUpperCase()}]:`, error);
            }
            return null;
        }
    }

    createNotificationListeners() {
        // Clean up existing listener if initialize is called multiple times
        this.unsubscribeOnMessage?.();

        // Foreground state messages
        this.unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            devDebugger.log('📬 [FCM FOREGROUND] Notification received:', remoteMessage.data);

            // Refresh unread count in global store
            useSystemStore.getState().fetchUnreadCount().catch(err => {
                devDebugger.error("Failed to fetch unread count on notification:", err);
            });

            // Trigger logout popup immediately if account was deactivated
            if (remoteMessage.data?.type === 'account_status_update') {
                handleSessionExpired(
                    'Account Status Updated',
                    'your accound has be deactived please logout it'
                );
            }

            // Refresh user profile if account status changes (e.g. KYC/Business document approval)
            if (
                remoteMessage.data?.type === NotificationType.PROFILE_APPROVED ||
                remoteMessage.data?.type === NotificationType.KYC_APPROVED ||
                remoteMessage.data?.type === NotificationType.BUSINESS_REGISTRATION_APPROVED ||
                remoteMessage.data?.type === NotificationType.BUSINESS_REGISTRATION_REJECTED
            ) {
                const userType = getUserType();
                if (userType === 'client') {
                    AuthService.getClientProfileInfo().then(response => {
                        if (response.success && response.data) {
                            useUserStore.getState().setClientProfile(response.data);
                        }
                    }).catch(err => devDebugger.error('Failed to fetch client profile on notification:', err));
                } else if (userType === 'contractor') {
                    const userId = getUserId();
                    if (userId) {
                        ContractorService.getProfileInfo(userId).then(response => {
                            if (response.success && response.data) {
                                useUserStore.getState().setProfile(response.data);
                            }
                        }).catch(err => devDebugger.error('Failed to fetch contractor profile on notification:', err));
                    }
                }
            }

            // Show a toast or local notification
            // On iOS, UNUserNotificationCenter in AppDelegate.swift automatically displays foreground notifications as banners.
            // Displaying via Notifee on iOS creates a duplicate notification banner.
            // Only Android requires manual Notifee display for standard foreground notifications.
            if (remoteMessage.notification && Platform.OS === 'android') {
                await this.displayIncomingNotification(remoteMessage);
            }
        });

        // Check if app was opened from a notification (Quit state) 
        // This is now handled in initialize() to avoid race conditions.

        // Notification caused app to open from background state
        messaging().onNotificationOpenedApp(remoteMessage => {
            devDebugger.log('🚀 [BACKGROUND CLICK] Notification received:', remoteMessage?.data);
            if (remoteMessage && remoteMessage.data) {
                const isLoggedIn = getIsLoggedIn();
                if (isLoggedIn) {
                    const userId = getUserId() || null;
                    const userType = getUserType() || null;
                    handleNotificationAction(remoteMessage.data, userId, userType);
                } else {
                    devDebugger.log('User not logged in on background notification open, no action');
                }
            }
        });

        // Token refresh
        messaging().onTokenRefresh(token => {
            // Token refresh log removed for privacy
        });
    }

    private isChatMessage(remoteMessage: any): boolean {
        const data = remoteMessage.data;
        return (
            data?.type === NotificationType.CHAT_MESSAGE ||
            data?.type === 'chat_message' ||
            Boolean(data?.conversationId) ||
            Boolean(data?.jobOrderId && (data?.message || data?.messageType))
        );
    }

    private resolveConversationKey(remoteMessage: any): string {
        return (
            (remoteMessage.data?.conversationId as string) ||
            (remoteMessage.data?.senderId as string) ||
            (remoteMessage.data?.jobOrderId as string) ||
            ''
        );
    }

    private isCurrentActiveChat(conversationKey: string, data: any): boolean {
        if (!conversationKey || !this.activeChatKey) return false;
        return (
            this.activeChatKey === conversationKey ||
            this.activeChatKey === data?.jobOrderId ||
            this.activeChatKey === data?.conversationId
        );
    }

    private parseSenderName(remoteMessage: any): string {
        const rawName =
            (remoteMessage.data?.senderName as string) ||
            (remoteMessage.data?.recipientName as string);

        if (rawName) return rawName;

        const notifTitle = remoteMessage.notification?.title;
        if (notifTitle) {
            const cleaned = notifTitle
                .replace(/^(?:New message from|Message from)\s+/i, '')
                .replace(/\s*\([^)]*\)\s*$/, '')
                .trim();
            if (cleaned) return cleaned;
        }

        return 'New Message';
    }

    private async cleanStaleNotifications(groupKey: string, conversationKey: string, senderName: string): Promise<void> {
        try {
            const displayed = await notifee.getDisplayedNotifications();
            for (const item of displayed) {
                const notifId = item.id || item.notification?.id;
                if (notifId && notifId !== groupKey) {
                    const notifData = item.notification?.data;
                    const notifConvKey = notifData?.conversationId || notifData?.jobOrderId || notifData?.senderId;
                    const isSameSender = senderName !== 'New Message' && item.notification?.title?.includes(senderName);
                    if (notifConvKey === conversationKey || isSameSender) {
                        await notifee.cancelNotification(notifId);
                    }
                }
            }
        } catch (cleanErr) {
            devDebugger.warn('Failed to clean separate notifications:', cleanErr);
        }
    }

    private async displayChatNotification(remoteMessage: any, conversationKey: string): Promise<void> {
        const groupKey = `chat_${conversationKey}`;
        const messageText =
            remoteMessage.notification?.body ||
            (remoteMessage.data?.message as string) ||
            '';

        const senderName = this.parseSenderName(remoteMessage);

        await this.cleanStaleNotifications(groupKey, conversationKey, senderName);

        const prevMessages = this.chatMessageHistory.get(conversationKey) || [];
        if (messageText) {
            prevMessages.push(messageText);
            if (prevMessages.length > 7) {
                prevMessages.shift();
            }
            this.chatMessageHistory.set(conversationKey, prevMessages);
        }

        const messageCount = prevMessages.length;
        const title = messageCount > 1
            ? `${senderName} (${messageCount} messages)`
            : senderName;

        const chatChannelId = Platform.OS === 'android'
            ? await notifee.createChannel({
                id: 'chat_messages',
                name: 'Chat Messages',
                importance: AndroidImportance.HIGH,
            })
            : undefined;

        await notifee.displayNotification({
            id: groupKey,
            title,
            body: messageText,
            data: remoteMessage.data || {},
            android: {
                channelId: chatChannelId || 'default',
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                style: prevMessages.length > 1 ? {
                    type: AndroidStyle.INBOX,
                    lines: prevMessages,
                } : undefined,
                pressAction: {
                    id: 'default',
                },
            },
            ios: {
                sound: 'default',
                threadId: groupKey,
                summaryArgument: senderName,
                summaryArgumentCount: messageCount,
            },
        });
    }

    private async displayStandardNotification(remoteMessage: any): Promise<void> {
        // On iOS, AppDelegate.swift (UNUserNotificationCenter) handles foreground banners natively.
        if (Platform.OS === 'ios') {
            return;
        }

        const defaultChannelId = Platform.OS === 'android'
            ? await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
            })
            : undefined;

        await notifee.displayNotification({
            id: remoteMessage.messageId || String(Date.now()),
            title: remoteMessage.notification?.title || 'Notification',
            body: remoteMessage.notification?.body || '',
            data: remoteMessage.data || {},
            android: {
                channelId: defaultChannelId || 'default',
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
            },
            ios: {
                sound: 'default',
            },
        });
    }

    public async displayIncomingNotification(remoteMessage: any) {
        if (!remoteMessage) return;
        try {
            const isChat = this.isChatMessage(remoteMessage);
            const conversationKey = this.resolveConversationKey(remoteMessage);

            if (isChat && conversationKey) {
                if (this.isCurrentActiveChat(conversationKey, remoteMessage.data)) {
                    return;
                }
                await this.displayChatNotification(remoteMessage, conversationKey);
            } else if (remoteMessage.notification) {
                await this.displayStandardNotification(remoteMessage);
            }
        } catch (err) {
            devDebugger.error('Error displaying local notification with notifee:', err);
        }
    }

    registerNotifeeHandlers() {
        notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS && detail.notification) {
                const data = detail.notification.data as any;
                devDebugger.log('👆 [NOTIFEE CLICK] Foreground notification pressed:', data);
                if (detail.notification.id?.startsWith('chat_')) {
                    const key = detail.notification.id.replace('chat_', '');
                    this.clearChatHistory(key);
                }
                if (data) {
                    const isLoggedIn = getIsLoggedIn();
                    if (isLoggedIn) {
                        const userId = getUserId() || null;
                        const userType = getUserType() || null;
                        handleNotificationAction(data, userId, userType);
                    }
                }
            }
        });
    }

    destroy() {
        this.unsubscribeOnMessage?.();
    }

    processInitialNotification() {
        if (this.initialNotificationPayload) {
            if (!navigationRef.isReady()) {
                devDebugger.log('Navigation not ready yet, deferring initial notification processing');
                return;
            }

            devDebugger.log('🔥 [COLD LAUNCH CLICK] Notification payload processed:', this.initialNotificationPayload);

            const isLoggedIn = getIsLoggedIn();
            if (isLoggedIn) {
                const userId = getUserId() || null;
                const userType = getUserType() || null;
                // Add a small delay to ensure all nested navigators are fully mounted and idle
                setTimeout(() => {
                    handleNotificationAction(this.initialNotificationPayload, userId, userType);
                    this.initialNotificationPayload = null;
                }, 500);
            } else {
                devDebugger.log('User not logged in on cold launch, skipping notification action');
                this.initialNotificationPayload = null;
            }
        }
    }
}

export default new NotificationService();
