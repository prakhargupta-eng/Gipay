import { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, Platform, Keyboard, Animated, NativeSyntheticEvent, NativeScrollEvent, TextInput, AppState, AppStateStatus } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import KeyboardManager from 'react-native-keyboard-manager';
import { io, Socket } from 'socket.io-client';
import moment from 'moment';
import strings from '@constants/strings';
import { Toast } from '@utils/ToastManager';
import { getSocketUrl } from '@config/apiConfig';
import chatService, { ChatMessage as ServerChatMessage } from '@config/chatService';
import { getToken, getUserId } from '@store/storage';
import { useUserStore } from '@store/useUserStore';
import { useNetInfo } from '@react-native-community/netinfo';
import { devDebugger } from '@utils/devDebugger';
import { getLocalDateTime } from '@utils/dateUtils';
import NotificationService from '@utils/NotificationService';

export const MAX_MESSAGE_LENGTH = 2000;

export interface Message {
    id: string;
    clientMessageId?: string;
    text: string;
    sender: 'user' | 'other';
    time: string;
    isRead?: boolean;
    readAt?: string | null;
    createdAt?: string;
}

export const getChatDateLabel = (dateStr?: string | Date): string => {
    if (!dateStr) return strings.chat.today;
    const m = moment(dateStr);
    if (!m.isValid()) return strings.chat.today;

    if (m.isSame(moment(), 'day')) {
        return strings.chat.today;
    }
    if (m.isSame(moment().subtract(1, 'day'), 'day')) {
        return strings.chat.yesterday;
    }
    const local = getLocalDateTime(dateStr);
    if (local?.date && local.date !== 'N/A') {
        return local.date;
    }
    return m.format('DD/MM/YYYY');
};

export type ChatScreenRouteParams = {
    ChatScreen?: {
        recipientName?: string;
        senderName?: string;
        recipientAvatar?: string;
        senderAvatar?: string;
        jobId?: string;
        jobOrderId?: string;
        jobTitle?: string;
        chatId?: string;
        recipientId?: string;
        senderId?: string;
        isChatDisabled?: boolean;
        disabled?: boolean;
    };
};

const extractMessageList = (resPayload: any): any[] => {
    if (Array.isArray(resPayload)) {
        return resPayload;
    }
    if (Array.isArray(resPayload?.data)) {
        return resPayload.data;
    }
    if (Array.isArray(resPayload?.messages)) {
        return resPayload.messages;
    }
    if (Array.isArray(resPayload?.results)) {
        return resPayload.results;
    }
    return [];
};

let chatMsgCounter = 0;
const generateUniqueId = (prefix = 'msg'): string => {
    chatMsgCounter = (chatMsgCounter + 1) % 1000000;
    return `${prefix}_${Date.now()}_${chatMsgCounter}`;
};

const calculateHasMore = (pagination: any, rawCount: number, limit: number): boolean => {
    const currentPage = Number(pagination?.currentPage ?? 1);
    const totalPages = typeof pagination?.totalPages === 'number' ? pagination.totalPages : undefined;
    const totalCount = typeof pagination?.totalCount === 'number' ? pagination.totalCount : undefined;

    if (typeof totalPages === 'number') {
        return currentPage < totalPages;
    }
    if (typeof totalCount === 'number') {
        return (currentPage * limit) < totalCount;
    }
    return rawCount >= limit;
};

const sortMessagesChronologically = (rawList: any[]): any[] => {
    return [...rawList].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeA - timeB;
    });
};

const mergeAuthoritativeMessages = (prev: Message[], formatted: Message[]): Message[] => {
    if (prev.length === 0) return formatted;

    const messageMap = new Map<string, Message>();
    const clientToIdMap = new Map<string, string>();

    // 1. Add authoritative server messages first
    formatted.forEach((m) => {
        const uniqueKey = m.id || m.clientMessageId;
        if (uniqueKey) {
            messageMap.set(uniqueKey, m);
            if (m.clientMessageId && m.id) {
                clientToIdMap.set(m.clientMessageId, m.id);
            }
        }
    });

    // 2. Add previous messages that aren't already represented
    prev.forEach((m) => {
        if (m.id && messageMap.has(m.id)) return;
        if (m.clientMessageId && clientToIdMap.has(m.clientMessageId)) return;
        if (m.clientMessageId && messageMap.has(m.clientMessageId)) return;

        const uniqueKey = m.id || m.clientMessageId;
        if (uniqueKey && !messageMap.has(uniqueKey)) {
            messageMap.set(uniqueKey, m);
        }
    });

    return Array.from(messageMap.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
    });
};

export const useChatViewModel = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ChatScreenRouteParams, 'ChatScreen'>>();
    const {
        recipientName: rawRecipientName,
        senderName: rawSenderName,
        recipientAvatar: rawRecipientAvatar,
        senderAvatar: rawSenderAvatar,
        jobOrderId: routeJobOrderId,
        chatId: routeChatId,
        isChatDisabled: routeIsChatDisabled,
        disabled: routeDisabled,
    } = route.params || {};

    const recipientName = rawRecipientName || rawSenderName;
    const recipientAvatar = rawRecipientAvatar || rawSenderAvatar;

    const jobOrderId = routeJobOrderId || routeChatId || '';
    const initialDisabled = Boolean(routeIsChatDisabled ?? routeDisabled ?? false);

    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false;

    const [isWritable, setIsWritable] = useState<boolean>(!initialDisabled);
    const [readOnlyReason, setReadOnlyReason] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
    const [initialLoadFailed, setInitialLoadFailed] = useState<boolean>(false);
    const [socketError, setSocketError] = useState<string | null>(null);

    const displayName = recipientName || strings.chat.defaultRecipient;
    const flatListRef = useRef<FlatList<Message>>(null);
    const socketRef = useRef<Socket | null>(null);
    const hasFetchedHistoryRef = useRef<boolean>(false);
    const mountedRef = useRef<boolean>(true);
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    // Pagination & Scroll Position Refs & States
    const pageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isNearBottomRef = useRef<boolean>(true);
    const isInitialLoadRef = useRef<boolean>(true);
    const isLoadingMoreRef = useRef<boolean>(false);
    const isLoadingHistoryRef = useRef<boolean>(false);

    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const [messageText, setMessageText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const isSendingRef = useRef<boolean>(false);
    const sendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const profile = useUserStore((state) => state.profile);
    const clientProfile = useUserStore((state) => state.clientProfile);
    const storedUserId = getUserId();
    const currentUserId =
        storedUserId ||
        profile?.user?._id ||
        clientProfile?.user?._id ||
        (profile as any)?._id ||
        (clientProfile as any)?._id ||
        '';

    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Reliable debounced scroll to bottom without jitter or multiple animations fighting each other
    const scrollToBottom = useCallback((animated = true) => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
        }

        requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated });
        });

        if (Platform.OS === 'android') {
            scrollTimeoutRef.current = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, []);

    // Format raw server message into Message UI model
    const formatServerMessage = useCallback(
        (msg: any): Message => {
            const senderId =
                typeof msg.sender === 'object'
                    ? msg.sender?._id || msg.sender?.id
                    : msg.senderId || msg.sender;
            const isUser =
                Boolean(msg.isMine) ||
                Boolean(currentUserId && senderId && String(senderId) === String(currentUserId)) ||
                msg.senderType === 'self' ||
                msg.senderType === 'user';

            let timeStr = 'Just now';
            const timestamp = msg.createdAt || msg.timestamp || msg.time;
            if (timestamp) {
                timeStr = moment(timestamp).isValid()
                    ? moment(timestamp).format('h:mm A')
                    : String(timestamp);
            }

            const rawText = msg.message || msg.content || msg.text || '';

            const serverMsgId = msg._id || (msg as any).id;
            return {
                id: serverMsgId || msg.clientMessageId || generateUniqueId('fallback'),
                clientMessageId: msg.clientMessageId,
                text: typeof rawText === 'string' ? rawText : String(rawText || ''),
                sender: isUser ? 'user' : 'other',
                time: timeStr,
                isRead: Boolean(msg.isRead) || Boolean(msg.readAt),
                readAt: msg.readAt || null,
                createdAt: timestamp || new Date().toISOString(),
            };
        },
        [currentUserId]
    );

    const formatServerMessageRef = useRef(formatServerMessage);
    formatServerMessageRef.current = formatServerMessage;

    // ─────────────────────────────────────────────────────────────
    // Fetch Message History via REST API (Initial screen load: page 1)
    // ─────────────────────────────────────────────────────────────
    const fetchMessageHistory = useCallback(async () => {
        if (!jobOrderId || hasFetchedHistoryRef.current || isLoadingHistoryRef.current) return;
        hasFetchedHistoryRef.current = true;
        isLoadingHistoryRef.current = true;
        setIsLoadingHistory(true);
        pageRef.current = 1;

        try {
            const response = await chatService.getMessages(jobOrderId, 1, 10);
            if (!mountedRef.current) return;

            const resPayload = response?.data;
            const rawList: any[] = extractMessageList(resPayload);
            devDebugger.log('📜 Fetched chat history count:', rawList.length);

            const pagination =
                (resPayload as any)?.pagination ||
                (response as any)?.pagination ||
                null;

            const currentPage = Number(pagination?.currentPage ?? 1);
            const limit = Number(pagination?.limit || 10);
            const moreAvailable = calculateHasMore(pagination, rawList.length, limit);

            hasMoreRef.current = moreAvailable;
            setHasMore(moreAvailable);
            pageRef.current = currentPage;

            if (rawList.length > 0) {
                const sortedRaw = sortMessagesChronologically(rawList);
                const formatted = sortedRaw.map(formatServerMessageRef.current);
                setMessages((prev) => mergeAuthoritativeMessages(prev, formatted));
                isInitialLoadRef.current = true;
                if (isNearBottomRef.current) {
                    scrollToBottom(false);
                }
            }

            if (resPayload && typeof (resPayload as any).isWritable === 'boolean') {
                setIsWritable((resPayload as any).isWritable);
            }
            if (resPayload && (resPayload as any).readOnlyReason) {
                setReadOnlyReason((resPayload as any).readOnlyReason);
            }
            if (mountedRef.current) {
                setInitialLoadFailed(false);
            }
        } catch (error: any) {
            devDebugger.error('Failed to fetch chat history via REST API:', error);
            hasFetchedHistoryRef.current = false;
            if (mountedRef.current) {
                setInitialLoadFailed(true);
                const errorMsg = error?.message || strings.chat.loadFailedDesc;
                Toast.showError(errorMsg);
            }
        } finally {
            isLoadingHistoryRef.current = false;
            if (mountedRef.current) {
                setIsLoadingHistory(false);
            }
        }
    }, [jobOrderId, scrollToBottom]);

    // ─────────────────────────────────────────────────────────────
    // Load More (Pagination: Fetch older messages when scrolling to top)
    // ─────────────────────────────────────────────────────────────
    const loadMoreMessages = useCallback(async () => {
        if (!jobOrderId || isLoadingMoreRef.current || isLoadingHistoryRef.current || !hasMoreRef.current) {
            return;
        }

        isNearBottomRef.current = false;
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
        const nextPage = pageRef.current + 1;
        devDebugger.log(`📜 Loading older messages for page ${nextPage}...`);

        try {
            const response = await chatService.getMessages(jobOrderId, nextPage, 10);
            if (!mountedRef.current) return;

            const resPayload = response?.data;
            const rawList: any[] = extractMessageList(resPayload);
            devDebugger.log(`📜 Loaded ${rawList.length} older messages from page ${nextPage}`);

            const pagination =
                (resPayload as any)?.pagination ||
                (response as any)?.pagination ||
                null;

            const currentPage = Number(pagination?.currentPage ?? nextPage);
            const limit = Number(pagination?.limit || 10);
            const moreAvailable = calculateHasMore(pagination, rawList.length, limit);

            hasMoreRef.current = moreAvailable;
            setHasMore(moreAvailable);

            if (rawList.length > 0) {
                pageRef.current = currentPage;
                const sortedRaw = sortMessagesChronologically(rawList);
                const olderFormatted = sortedRaw.map(formatServerMessageRef.current);

                setMessages((prev) => {
                    const existingIds = new Set<string>();
                    const existingClientIds = new Set<string>();
                    prev.forEach((m) => {
                        if (m.id) existingIds.add(m.id);
                        if (m.clientMessageId) existingClientIds.add(m.clientMessageId);
                    });

                    const filteredOlder = olderFormatted.filter((m) => {
                        if (m.id && existingIds.has(m.id)) return false;
                        if (m.clientMessageId && existingClientIds.has(m.clientMessageId)) return false;
                        return true;
                    });
                    return [...filteredOlder, ...prev];
                });
            } else {
                hasMoreRef.current = false;
                setHasMore(false);
            }
        } catch (error) {
            devDebugger.error('Failed to load more chat messages:', error);
        } finally {
            // Keep ref guard locked briefly (350ms) to allow FlatList maintainVisibleContentPosition & layout to settle
            setTimeout(() => {
                isLoadingMoreRef.current = false;
                if (mountedRef.current) {
                    setIsLoadingMore(false);
                }
            }, 350);
        }
    }, [jobOrderId]);

    // Handle list scroll: load older messages when user reaches near the top
    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
            // 1. Detect scroll near top (within 30px)
            if (contentOffset.y <= 30 && hasMoreRef.current && !isLoadingMoreRef.current && !isLoadingHistoryRef.current) {
                loadMoreMessages();
            }
            // 2. Detect if user is near bottom (within 250px)
            const paddingToBottom = 250;
            const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
            isNearBottomRef.current = isCloseToBottom;
        },
        [loadMoreMessages]
    );

    useEffect(() => {
        fetchMessageHistory();
    }, [fetchMessageHistory]);

    const prevConnectedRef = useRef(netInfo.isConnected);
    useEffect(() => {
        if (prevConnectedRef.current === false && netInfo.isConnected === true) {
            hasFetchedHistoryRef.current = false;
            fetchMessageHistory();
            if (socketRef.current && !socketRef.current.connected) {
                socketRef.current.connect();
            }
        }
        prevConnectedRef.current = netInfo.isConnected;
    }, [netInfo.isConnected, fetchMessageHistory]);

    // AppState & background timer references (declared before socket initialization)
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─────────────────────────────────────────────────────────────
    // Initialize Socket Connection with JWT Token & Event Listeners
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const token = getToken();
        if (!jobOrderId || !token) {
            devDebugger.warn('ChatScreen: Missing jobOrderId or token for socket connection');
            return;
        }

        const socketUrl = getSocketUrl();
        devDebugger.log('⚡ Initializing Chat Socket at:', socketUrl, 'for jobOrderId:', jobOrderId);

        // 1. Initialize Socket Connection with JWT Token
        const socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        // Handle Connection Events
        socket.on('connect', () => {
            devDebugger.log('⚡ Socket connected:', socket.id);
            // Edge case: if connection completed while app moved to background, disconnect immediately
            if (appStateRef.current !== 'active') {
                devDebugger.log('⚡ Socket connected while in background -> Disconnecting immediately');
                try {
                    socket.disconnect();
                } catch {}
                return;
            }
            setIsConnected(true);
            setSocketError(null);
            // 2. Join the Chat Room
            socket.emit('chat:join', { jobOrderId });
        });

        socket.on('disconnect', (reason) => {
            devDebugger.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
        });

        // 3. Listen for Room Joined Confirmation
        socket.on('chat:joined', (data: { isWritable: boolean; readOnlyReason?: string }) => {
            devDebugger.log('✅ Joined room:', data);
            if (!initialDisabled && typeof data?.isWritable === 'boolean') {
                setIsWritable(data.isWritable);
            }
            setReadOnlyReason(
                data?.readOnlyReason ||
                (initialDisabled ? strings.chat.chatDisabled : null)
            );
            // Mark room messages as read only if user is actively in the app
            if (appStateRef.current === 'active') {
                socket.emit('chat:read', { jobOrderId });
            }
        });

        // 4. Listen for Incoming Messages (broadcasted to sender & recipient)
        socket.on('chat:message', (newMessage: ServerChatMessage) => {
            devDebugger.log('📩 New message received:', newMessage);
            const formatted = formatServerMessageRef.current(newMessage);
            devDebugger.log('📩 Formatted message for UI:', formatted);

            let isNewMessage = false;
            setMessages((prev) => {
                const existingIndex = prev.findIndex(
                    (m) =>
                        (formatted.clientMessageId && m.clientMessageId === formatted.clientMessageId) ||
                        m.id === formatted.id
                );
                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...formatted };
                    return updated;
                }
                isNewMessage = true;
                return [...prev, formatted];
            });

            // Automatically scroll to bottom only when a new message was added (not an optimistic message confirmation)
            if (isNewMessage && appStateRef.current === 'active') {
                scrollToBottom(true);
            }

            // Acknowledge read only if message is from the other party AND app is actively in foreground
            if (formatted.sender === 'other' && appStateRef.current === 'active') {
                socket.emit('chat:read', { jobOrderId });
            }
        });

        // 5. Listen for Opponent Read Status Updates
        socket.on('chat:read', (data: { readAt?: string }) => {
            devDebugger.log('👁️ Messages read by opponent:', data);
            setMessages((prev) =>
                prev.map((msg) => ({
                    ...msg,
                    isRead: true,
                    readAt: data?.readAt || msg.readAt || new Date().toISOString(),
                }))
            );
        });

        // 6. Listen for Errors
        socket.on('chat:error', (err: any) => {
            devDebugger.error('⚠️ Chat Socket Error:', err);
            const errMsg = err?.message || 'An error occurred';
            setSocketError(errMsg);
            Toast.showError(errMsg);
        });

        // Cleanup on unmount / room change
        return () => {
            devDebugger.log('🚪 Leaving room & disconnecting...');
            try {
                socket.emit('chat:leave', { jobOrderId });
                socket.disconnect();
            } catch {}
            socketRef.current = null;
        };
    }, [jobOrderId, scrollToBottom]);

    // Track active chat in NotificationService to avoid noisy local notifications while viewing this conversation
    useEffect(() => {
        if (jobOrderId) {
            NotificationService.setActiveChatKey(jobOrderId);
        }
        return () => {
            NotificationService.setActiveChatKey(null);
        };
    }, [jobOrderId]);

    // AppState lifecycle: Manually disconnect socket on background; Reconnect and refresh on foreground
    useEffect(() => {
        const executeDisconnect = () => {
            devDebugger.log('📱 App entered background -> Manually disconnecting socket');
            NotificationService.setActiveChatKey(null);
            try {
                if (socketRef.current) {
                    if (jobOrderId && socketRef.current.connected) {
                        socketRef.current.emit('chat:leave', { jobOrderId });
                    }
                    socketRef.current.disconnect();
                }
            } catch (err) {
                devDebugger.warn('Error disconnecting socket on background:', err);
            }
            if (mountedRef.current) {
                setIsConnected(false);
            }
        };

        const handleBackgroundTransition = (isGoingBackground: boolean) => {
            if (isGoingBackground) {
                // Full background transition (home screen, app switcher) -> disconnect immediately
                executeDisconnect();
            } else {
                // Inactive (iOS notification pull-down, FaceID / permissions dialog)
                // Debounce by 250ms: if user immediately returns to active, avoid rapid socket thrashing
                backgroundTimerRef.current = setTimeout(() => {
                    if (appStateRef.current !== 'active') {
                        executeDisconnect();
                    }
                }, 250);
            }
        };

        const handleForegroundTransition = () => {
            devDebugger.log('📱 App returned to foreground -> Manually reconnecting socket');
            if (jobOrderId) {
                NotificationService.setActiveChatKey(jobOrderId);
            }

            // If offline, skip socket connect (netInfo listener will connect when online)
            if (netInfo.isConnected !== false) {
                try {
                    const token = getToken();
                    if (socketRef.current) {
                        if (token) {
                            socketRef.current.auth = { token };
                        }
                        if (!socketRef.current.connected) {
                            socketRef.current.connect();
                        }
                    }
                } catch (err) {
                    devDebugger.warn('Error reconnecting socket on foreground:', err);
                }
            }

            // Refresh messages to catch any messages received while in background
            hasFetchedHistoryRef.current = false;
            pageRef.current = 1;
            fetchMessageHistory();
        };

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            const wasActive = appStateRef.current === 'active';
            const isNowActive = nextAppState === 'active';

            // Clear any pending debounced background disconnect timer
            if (backgroundTimerRef.current) {
                clearTimeout(backgroundTimerRef.current);
                backgroundTimerRef.current = null;
            }

            if (wasActive && !isNowActive) {
                handleBackgroundTransition(nextAppState === 'background');
            } else if (!wasActive && isNowActive) {
                handleForegroundTransition();
            }

            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (backgroundTimerRef.current) {
                clearTimeout(backgroundTimerRef.current);
                backgroundTimerRef.current = null;
            }
            subscription.remove();
        };
    }, [jobOrderId, fetchMessageHistory, netInfo.isConnected]);

    // Keyboard handlers: smoothly animates keyboardHeight to push the bottom chat box above the keyboard
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            setIsKeyboardVisible(true);
            const h = e?.endCoordinates?.height || 0;
            const duration = Platform.OS === 'ios' ? (e?.duration || 250) : 0;
            Animated.timing(keyboardHeight, {
                toValue: h,
                duration,
                useNativeDriver: false,
            }).start();

            scrollToBottom(true);
        });

        const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
            setIsKeyboardVisible(false);
            const duration = Platform.OS === 'ios' ? (e?.duration || 250) : 0;
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration,
                useNativeDriver: false,
            }).start();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [keyboardHeight, scrollToBottom]);

    // Disable iOS IQKeyboardManager in chat screen so only the input bar moves, not the header
    useEffect(() => {
        if (Platform.OS === 'ios') {
            KeyboardManager.setEnable(false);
            KeyboardManager.setEnableAutoToolbar(false);
        }
        return () => {
            if (Platform.OS === 'ios') {
                KeyboardManager.setEnable(true);
                KeyboardManager.setEnableAutoToolbar(true);
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if (sendingTimeoutRef.current) {
                clearTimeout(sendingTimeoutRef.current);
            }
        };
    }, []);

    // Handle text change with guard to drop in-flight text updates during sending (fixes iOS race condition)
    const handleTextChange = useCallback((text: string) => {
        if (isSendingRef.current) {
            inputRef.current?.clear();
            if (Platform.OS === 'ios') {
                inputRef.current?.setNativeProps({ text: '' });
            }
            return;
        }
        setMessageText(text);
    }, []);

    // Function: Send Message
    const handleSend = useCallback(() => {
        const trimmed = messageText.trim();
        if (!socketRef.current || !trimmed || trimmed.length > MAX_MESSAGE_LENGTH || !isWritable || initialDisabled || isOffline) return;

        const clientMessageId = generateUniqueId('temp');
        const optimisticMsg: Message = {
            id: clientMessageId,
            clientMessageId,
            text: trimmed,
            sender: 'user',
            time: moment().format('h:mm A'),
            isRead: false,
            createdAt: new Date().toISOString(),
        };

        devDebugger.log('📤 Sending chat message:', { jobOrderId, message: trimmed, clientMessageId });
        isNearBottomRef.current = true;

        // Guard against iOS keyboard predictive text / autocorrect flushing stale text right after send
        isSendingRef.current = true;
        if (sendingTimeoutRef.current) {
            clearTimeout(sendingTimeoutRef.current);
        }
        sendingTimeoutRef.current = setTimeout(() => {
            isSendingRef.current = false;
        }, 150);

        // Immediate state clear
        setMessageText('');

        // Imperative native clear (essential for iOS multiline TextInput which can drop controlled value="")
        inputRef.current?.clear();
        if (Platform.OS === 'ios') {
            inputRef.current?.setNativeProps({ text: '' });
        }

        // Post-frame cleanup to catch deferred iOS layout / text-view cycles
        requestAnimationFrame(() => {
            inputRef.current?.clear();
            if (Platform.OS === 'ios') {
                inputRef.current?.setNativeProps({ text: '' });
            }
        });

        // Optimistic UI update
        setMessages((prev) => [...prev, optimisticMsg]);

        scrollToBottom(true);

        // Emit chat:send event with trimmed text
        socketRef.current.emit('chat:send', {
            jobOrderId,
            message: trimmed,
            clientMessageId,
        });
    }, [messageText, isWritable, initialDisabled, isOffline, jobOrderId, scrollToBottom]);

    // Validation: disable send button if empty, beyond 2000 chars, not writable, or offline
    const isSendDisabled =
        messageText.trim().length === 0 ||
        messageText.length > MAX_MESSAGE_LENGTH ||
        !isWritable ||
        initialDisabled ||
        isOffline;

    // Function: Mark Room as Read
    const markAsRead = useCallback(() => {
        if (socketRef.current && isConnected && jobOrderId) {
            socketRef.current.emit('chat:read', { jobOrderId });
        }
    }, [isConnected, jobOrderId]);

    // Retry loading chat history (used by center retry button)
    const handleRetry = useCallback(async () => {
        if (!jobOrderId || isLoadingHistoryRef.current || isOffline) return;
        hasFetchedHistoryRef.current = false;
        pageRef.current = 1;
        await fetchMessageHistory();
    }, [jobOrderId, isOffline, fetchMessageHistory]);

    const handleClearChat = useCallback(() => {
        setMessages([]);
        setShowMenu(false);
        Toast.showSuccess(strings.chat.clearChat);
    }, []);

    const handleToggleMute = useCallback(() => {
        setIsMuted((prev) => !prev);
        setShowMenu(false);
        Toast.showInfo(!isMuted ? strings.chat.muteNotifications : 'Notifications unmuted');
    }, [isMuted]);

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return {
        insets,
        navigation,
        displayName,
        recipientAvatar,
        flatListRef,
        inputRef,
        messageText,
        setMessageText,
        handleTextChange,
        showMenu,
        setShowMenu,
        isMuted,
        isKeyboardVisible,
        messages,
        isWritable,
        setIsWritable,
        isChatDisabled: initialDisabled || !isWritable,
        readOnlyReason,
        isConnected,
        isLoadingHistory,
        initialLoadFailed,
        isLoadingMore,
        isLoadingMoreRef,
        hasMore,
        socketError,
        handleSend,
        isSendDisabled,
        MAX_MESSAGE_LENGTH,
        markAsRead,
        handleRetry,
        handleRefresh: handleRetry,
        loadMoreMessages,
        handleScroll,
        scrollToBottom,
        isNearBottomRef,
        isInitialLoadRef,
        handleClearChat,
        handleToggleMute,
        handleGoBack,
        keyboardHeight,
        isOffline,
    };
};
