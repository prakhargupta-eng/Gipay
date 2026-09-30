import React, { useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    StatusBar,
    Animated,
    ActivityIndicator,
} from 'react-native';
import AppText from '@components/AppText';
import TopHeader from '@components/TopHeader';
import colors from '@styles/colors';
import { verticalScale } from '@styles/mixins';
import strings from '@constants/strings';
import moment from 'moment';
import { useChatViewModel, Message, getChatDateLabel } from './useChatViewModel';
import styles from './styles';

const TICK_ICON = require('@assets/images/common/tick.png');
const DOUBLE_TICK_ICON = require('@assets/images/common/doubleTick.png');

interface ChatMessageItemProps {
    item: Message;
    recipientAvatar: any;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({ item, recipientAvatar }) => {
    const textContent = item.text || (item as any)?.message || (item as any)?.content || '';
    const isOther = item.sender === 'other';

    if (isOther) {
        const avatarUri =
            typeof recipientAvatar === 'string' && recipientAvatar.trim().length > 0
                ? recipientAvatar
                : (recipientAvatar as any)?.uri || (recipientAvatar as any)?.url || null;

        return (
            <View style={styles.receivedRow}>
                <Image
                    source={
                        avatarUri
                            ? { uri: avatarUri }
                            : require('@assets/images/common/dummyUser.png')
                    }
                    style={styles.avatar}
                    resizeMode="cover"
                />
                <View style={styles.receivedBubbleContainer}>
                    <View style={styles.receivedBubble}>
                        <AppText style={styles.receivedText}>{textContent}</AppText>
                        <View style={styles.receivedStatusContainer}>
                            <AppText style={styles.receivedTimeText}>{item.time}</AppText>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    const isRead = Boolean(item.isRead || item.readAt);

    return (
        <View style={styles.sentRow}>
            <View style={styles.sentBubble}>
                <AppText style={styles.sentText}>{textContent}</AppText>
                <View style={styles.sentStatusContainer}>
                    <AppText style={styles.sentTimeText}>{item.time}</AppText>
                    <Image
                        source={isRead ? DOUBLE_TICK_ICON : TICK_ICON}
                        style={[
                            styles.sentTickIcon,
                            isRead ? styles.sentTickIconRead : styles.sentTickIconUnread,
                        ]}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
});

interface ChatScreenProps {
    isChatDisabled?: boolean;
    disabled?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = (props) => {
    const {
        insets,
        displayName,
        recipientAvatar,
        flatListRef,
        inputRef,
        messageText,
        handleTextChange,
        isKeyboardVisible,
        messages,
        isWritable,
        isChatDisabled: vmIsChatDisabled,
        readOnlyReason,
        isLoadingHistory,
        initialLoadFailed,
        isLoadingMore,
        isLoadingMoreRef,
        handleRetry,
        handleSend,
        isSendDisabled,
        MAX_MESSAGE_LENGTH,
        handleScroll,
        scrollToBottom,
        isNearBottomRef,
        isInitialLoadRef,
        handleGoBack,
        keyboardHeight,
        isOffline,
    } = useChatViewModel();

    const isChatDisabled = (props.isChatDisabled ?? props.disabled) || vmIsChatDisabled || !isWritable;

    const renderItem = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            const prevItem = index > 0 ? messages[index - 1] : null;
            const isSameDay =
                Boolean(prevItem) &&
                Boolean(item.createdAt) &&
                Boolean(prevItem?.createdAt) &&
                moment(item.createdAt).isValid() &&
                moment(prevItem?.createdAt).isValid() &&
                moment(item.createdAt).isSame(moment(prevItem?.createdAt), 'day');

            const showDateHeader = index === 0 || !isSameDay;
            const dateLabel = showDateHeader ? getChatDateLabel(item.createdAt) : null;

            return (
                <View>
                    {showDateHeader && !!dateLabel && (
                        <View style={styles.dateBadgeContainer}>
                            <View style={styles.dateBadge}>
                                <AppText style={styles.dateBadgeText}>{dateLabel}</AppText>
                            </View>
                        </View>
                    )}
                    <ChatMessageItem item={item} recipientAvatar={recipientAvatar} />
                </View>
            );
        },
        [messages, recipientAvatar]
    );

    const renderLoadingState = () => (
        <View style={styles.centerLoaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    const renderErrorState = () => {
        const isRetryDisabled = Boolean(isOffline || isLoadingHistory);

        return (
            <View style={styles.centerErrorContainer}>
                <Image
                    source={
                        isOffline
                            ? require('@assets/images/common/noInternet.png')
                            : require('@assets/images/common/noData.png')
                    }
                    style={styles.centerErrorImage}
                    resizeMode="contain"
                />
                <AppText style={styles.centerErrorTitle}>
                    {isOffline ? strings.chat.noInternetTitle : strings.chat.unableToLoadMessages}
                </AppText>
                <AppText style={styles.centerErrorDesc}>
                    {isOffline ? strings.chat.noInternetDesc : strings.chat.loadFailedDesc}
                </AppText>

                {/* Center Reload / Retry Button */}
                <TouchableOpacity
                    style={[
                        styles.centerRetryButton,
                        isRetryDisabled && styles.centerRetryButtonDisabled,
                    ]}
                    onPress={handleRetry}
                    disabled={isRetryDisabled}
                    activeOpacity={0.8}
                >
                    {isLoadingHistory ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText
                            style={[
                                styles.centerRetryButtonText,
                                isRetryDisabled && styles.centerRetryButtonTextDisabled,
                            ]}
                        >
                            {strings.chat.retry}
                        </AppText>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyMessages = () => {
        if (isLoadingHistory) return null;
        return (
            <View style={styles.emptyContainer}>
                <Image
                    source={require('@assets/images/common/nochat.png')}
                    style={styles.emptyImage}
                    resizeMode="contain"
                />
                <AppText style={styles.emptyTitle}>
                    {strings.chat.noChatAvailableTitle}
                </AppText>
                <AppText style={styles.emptyDesc}>
                    {strings.chat.noChatAvailableDesc}
                </AppText>
            </View>
        );
    };

    const handleContentSizeChange = () => {
        if (isInitialLoadRef.current && messages.length > 0) {
            isInitialLoadRef.current = false;
            scrollToBottom(false);
        } else if (!isLoadingMoreRef.current && isNearBottomRef.current) {
            scrollToBottom(true);
        }
    };

    const renderBottomBar = () => {
        if (isChatDisabled) {
            return (
                <View
                    style={[
                        styles.readOnlyBanner,
                        {
                            paddingBottom: insets.bottom > 0
                                ? insets.bottom + verticalScale(12)
                                : verticalScale(12),
                        },
                    ]}
                >
                    <AppText style={styles.readOnlyText}>
                        {readOnlyReason || strings.chat.chatDisabled}
                    </AppText>
                </View>
            );
        }

        return (
            <View
                style={[
                    styles.inputBarContainer,
                    {
                        paddingTop: verticalScale(10),
                        paddingBottom: !isKeyboardVisible && insets.bottom > 0
                            ? insets.bottom + verticalScale(10)
                            : verticalScale(10),
                    },
                ]}
            >
                {messageText.length > 1800 && (
                    <View style={styles.charCountContainer}>
                        <AppText
                            style={[
                                styles.charCountText,
                                messageText.length >= MAX_MESSAGE_LENGTH && styles.charCountLimit,
                            ]}
                        >
                            {`${messageText.length}/${MAX_MESSAGE_LENGTH}`}
                        </AppText>
                    </View>
                )}
                <View style={styles.inputRow}>
                    {/* Input Pill - dynamically expands up to 3 lines, then scrolls */}
                    <View style={[styles.inputPill, isOffline && styles.inputPillDisabled]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, isOffline && styles.textInputDisabled]}
                            placeholder={isOffline ? strings.chat.noInternetAccess : strings.chat.typeQueryPlaceholder}
                            placeholderTextColor="#9CA3AF"
                            value={messageText}
                            onChangeText={handleTextChange}
                            multiline
                            scrollEnabled
                            submitBehavior="newline"
                            maxLength={MAX_MESSAGE_LENGTH}
                            editable={!isOffline}
                        />
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[
                            styles.sendBtn,
                            isSendDisabled && styles.sendBtnDisabled,
                        ]}
                        activeOpacity={0.8}
                        disabled={isSendDisabled}
                    >
                        <Image
                            source={require('@assets/images/common/send.png')}
                            style={styles.sendIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderChatContent = () => {
        if (isLoadingHistory && messages.length === 0 && !initialLoadFailed) {
            return renderLoadingState();
        }

        if ((initialLoadFailed || isOffline) && messages.length === 0) {
            return renderErrorState();
        }

        /* ─── Smooth Animated Chat Body (List + Input Bar) ──────── */
        return (
            <Animated.View
                style={[
                    styles.chatBodyContainer,
                    { paddingBottom: keyboardHeight },
                ]}
            >
                {/* Scrolling Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id || item.clientMessageId || `msg-${index}`}
                    renderItem={renderItem}
                    style={styles.messagesList}
                    contentContainerStyle={[
                        styles.messagesContent,
                        messages.length === 0 && styles.emptyListContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
                    onScroll={handleScroll}
                    scrollEventThrottle={32}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={15}
                    windowSize={10}
                    onContentSizeChange={handleContentSizeChange}
                    ListHeaderComponent={
                        isLoadingMore ? (
                            <View style={styles.topLoaderContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={renderEmptyMessages}
                />

                {renderBottomBar()}
            </Animated.View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />

            {/* ─── 1. Static Top Header (Fixed at the top) ─── */}
            <View style={styles.headerContainer}>
                <TopHeader
                    title={displayName}
                    onBack={handleGoBack}
                />
                <View style={styles.seperator} />
            </View>



            {/* ─── 2. Offline No-Internet State OR Center Loading OR Active Chat Body ──────── */}
            {renderChatContent()}
        </View>
    );
};

export default ChatScreen;
