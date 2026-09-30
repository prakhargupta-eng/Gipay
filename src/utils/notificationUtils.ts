import { Platform, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { check, request, RESULTS } from 'react-native-permissions';
import { navigate, navigationRef } from '@navigation/NavigationService';
import { JobStatus, NotificationType } from '@constants/enums';
import { devDebugger } from '@utils/devDebugger';

export const checkNotificationPermission = async () => {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
            const result = await check('android.permission.POST_NOTIFICATIONS' as any);
            devDebugger.log('[Notifications] Android check result:', result);
            return result;
        }
        devDebugger.log('[Notifications] Android < 33, auto-granted');
        return RESULTS.GRANTED;
    } else {
        const authStatus = await messaging().hasPermission();
        devDebugger.log('[Notifications] iOS check result:', authStatus);
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            return RESULTS.GRANTED;
        } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
            return RESULTS.BLOCKED;
        } else {
            return RESULTS.DENIED;
        }
    }
};

export const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
            const result = await request('android.permission.POST_NOTIFICATIONS' as any);
            devDebugger.log('[Notifications] Android request result:', result);
            return result;
        }
        return RESULTS.GRANTED;
    } else {
        const authStatus = await messaging().requestPermission();
        devDebugger.log('[Notifications] iOS requestPermission result:', authStatus);
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled ? RESULTS.GRANTED : RESULTS.BLOCKED;
    }
};

export const handleNotificationToggleLogic = async (
    value: boolean,
    setLoading: (loading: boolean) => void,
    setSwitchValue: (val: boolean) => void,
    apiCallback: (val: boolean, token?: string, type?: string) => Promise<any>
) => {
    setLoading(true);

    try {
        if (!value) {
            // Turning OFF
            devDebugger.log('[Notifications] Turning OFF');
            try {
                await apiCallback(false);
            } catch (e) {
                devDebugger.log('[Notifications] Turn off API error (ignored):', e);
            }
            setSwitchValue(false);
            return;
        }

        // Turning ON — check permission first
        devDebugger.log('[Notifications] Turning ON — checking permission...');
        let status = await checkNotificationPermission();

        // Not yet asked — show the native popup
        if (status === RESULTS.DENIED) {
            devDebugger.log('[Notifications] Permission denied — requesting...');
            status = await requestNotificationPermission();
            devDebugger.log('[Notifications] Permission after request:', status);
        }

        // Permanently blocked — show alert with Open Settings
        if (status === RESULTS.BLOCKED) {
            devDebugger.log('[Notifications] Permission blocked — showing settings alert');
            Alert.alert(
                'Notifications Disabled',
                'Please enable notifications in your device settings to receive updates.',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setSwitchValue(false) },
                    {
                        text: 'Open Settings',
                        onPress: () => {
                            Linking.openSettings();
                            setSwitchValue(false);
                        }
                    }
                ]
            );
            return;
        }

        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
            // ✅ Optimistically turn the switch ON immediately
            setSwitchValue(true);
            if (__DEV__) {
                devDebugger.log('[Notifications] Permission granted — switch turned ON');
            }

            // Get FCM device token
            let deviceToken: string | undefined;
            try {
                deviceToken = await messaging().getToken();
                // Token log completely removed for privacy
            } catch (e) {
                if (__DEV__) {
                    devDebugger.log('[Notifications] Failed to get FCM token:', e);
                }
            }

            // Call API — keep switch ON regardless of API result
            try {
                const deviceType = Platform.OS;
                const res = await apiCallback(true, deviceToken, deviceType);
                if (__DEV__) {
                    devDebugger.log('[Notifications] API response received');
                }
            } catch (e) {
                if (__DEV__) {
                    devDebugger.log('[Notifications] API call error (switch stays ON):', e);
                }
            }
        } else {
            if (__DEV__) {
                devDebugger.log('[Notifications] Permission not granted, status:', status);
            }
            setSwitchValue(false);
        }
    } catch (error) {
        devDebugger.error('[Notifications] Unexpected error:', error);
        setSwitchValue(false);
    } finally {
        setLoading(false);
    }
};


// Check if notification has a redirection action
export const hasRedirectionAction = (type: string, currentUserType?: string | null): boolean => {
    switch (type) {
        case NotificationType.DISPUTE_RESOLVED:
        case NotificationType.DISPUTE_RAISED:
        case NotificationType.JOB_INVITE:
        case NotificationType.MATCH_CONFIRMED:
        case NotificationType.RATE_PROPOSAL:
        case NotificationType.UPCOMING_JOB:
        case NotificationType.INVITE_RESPONSE:
        case NotificationType.JOB_COMPLETED:
        case NotificationType.WITHDRAWAL_APPROVED:
        case NotificationType.WITHDRAWAL_REJECTED:
        case NotificationType.CERTIFICATE_APPROVED:
        case NotificationType.CERTIFICATE_REJECTED:
        case NotificationType.INVITATION_ACCEPTED:
        case NotificationType.PENDING_RATING:
        case NotificationType.PROFILE_COMPLETION:
        case NotificationType.NEXT_HOUR_JOB_ALERT:
        case NotificationType.COUNTER_OFFER:
        case NotificationType.CONTRACTOR_CLOCK_OUT:
        case NotificationType.ADD_MONEY_SUCCESS:
            return true;

        case NotificationType.HOURS_ADJUSTED:
        case NotificationType.PROFILE_APPROVED:
        case NotificationType.PROFILE_REJECTED:
        case NotificationType.BUSINESS_REGISTRATION_APPROVED:
        case NotificationType.BUSINESS_REGISTRATION_REJECTED:
            return currentUserType === 'client';

        case NotificationType.KYC_REJECTED:
        case NotificationType.PAYMENT_INITIATED:
            return currentUserType === 'contractor';

        case NotificationType.SECURITY_ALERT:
        case NotificationType.JOB_CANCELLED:
        case NotificationType.APPLICATION_ACCEPTED:
        case NotificationType.APPLICATION_REJECTED:
        case NotificationType.CONTRACTOR_CLOCK_IN:
        case NotificationType.MATCH_REJECTED:
        case NotificationType.KYC_APPROVED:
        case NotificationType.KYC_UNDER_REVIEW:
        case NotificationType.ESCROW_CREDITED:
        case NotificationType.ACCOUNT_STATUS_UPDATE:
        default:
            return false;
    }
};


// Handle notification action
export const handleNotificationAction = (
    item: any,
    currentUserId: string | null,
    currentUserType: string | null,
    onShowKycPopup?: () => void
) => {
    if (!item) return;

    devDebugger.log('🔔 [Notifications] Push notification payload:', item);

    // Before navigation, check if navigation is ready/available
    if (!navigationRef.isReady()) {
        devDebugger.log("[Notifications] Navigation is not ready yet, deferring action");
        // Store it in NotificationService to be processed when navigation becomes ready
        import('./NotificationService').then(module => {
            module.default.initialNotificationPayload = item;
        });
        return;
    }

    // Validate userId match (if user id match else no action)
    if (item.userId && item.userId !== currentUserId) {
        devDebugger.log("Notification userId doesn't match current userId, ignoring action");
        return;
    }

    // Verify that the notification role matches the user's role
    if (item.role && item.role !== currentUserType) {
        devDebugger.log("Notification role doesn't match current userType, ignoring action");
        return;
    }
    const dataId = item.dataId;
    switch (item.type) {
        case NotificationType.CHAT_MESSAGE:
        case 'chat_message': {
            const targetJobOrderId = item.jobOrderId || item.chatId || item.dataId;
            if (targetJobOrderId) {
                const parsedRecipientName =
                    item.senderName ||
                    item.sender_name ||
                    item.data?.senderName ||
                    item.data?.sender_name ||
                    item.recipientName ||
                    item.recipient_name ||
                    item.sender?.name ||
                    (item.notificationTitle
                        ? item.notificationTitle.replace(/^(?:New message from|Message from)\s+/i, '').replace(/\s*\(.*?\)\s*$/, '').trim()
                        : '');

                const recipientAvatar =
                    item.senderAvatar ||
                    item.sender_avatar ||
                    item.data?.senderAvatar ||
                    item.data?.sender_avatar ||
                    item.recipientAvatar ||
                    item.avatar ||
                    item.sender?.avatar;

                const targetRecipientId =
                    item.senderId ||
                    item.sender_id ||
                    item.data?.senderId ||
                    item.data?.sender_id ||
                    item.recipientId;

                devDebugger.log('[Notifications] Navigating to ChatScreen with:', {
                    jobOrderId: targetJobOrderId,
                    jobId: item.jobId,
                    recipientName: parsedRecipientName,
                    senderName: item.senderName || parsedRecipientName,
                });

                navigate('ChatScreen', {
                    jobOrderId: targetJobOrderId,
                    jobId: item.jobId,
                    chatId: item.chatId,
                    jobTitle: item.jobTitle,
                    recipientName: parsedRecipientName || (currentUserType === 'client' ? 'Contractor' : 'Client'),
                    senderName: item.senderName || parsedRecipientName || (currentUserType === 'client' ? 'Contractor' : 'Client'),
                    recipientAvatar,
                    senderAvatar: recipientAvatar,
                    recipientId: targetRecipientId,
                    senderId: targetRecipientId,
                });
            } else {
                devDebugger.warn('[Notifications] Missing jobOrderId or chatId in chat_message notification:', item);
            }
            break;
        }

        case NotificationType.DISPUTE_RESOLVED:
            if (dataId) {
                navigate('DisputeDetails', { disputeId: dataId, type: 'for' });
            }
            break;
        case NotificationType.DISPUTE_RAISED:
            if (dataId) {
                navigate('DisputeDetails', { disputeId: dataId, type: 'by' });
            }
            break;

        case NotificationType.JOB_INVITE:
            if (dataId) {
                if (currentUserType === 'client') {
                    navigate('JobInviteDetails', { invitationId: dataId });
                } else if (currentUserType === 'contractor') {
                    navigate('InvitationDetails', { jobData: { _id: dataId, id: dataId } });
                }
            }
            break;

        case NotificationType.HOURS_ADJUSTED:
            if (currentUserType === 'client' && dataId) {
                navigate('JobAwaitingApprovalDetails', { jobData: { _id: dataId, id: dataId } });
            }
            break;

        case NotificationType.PROFILE_APPROVED:
        case NotificationType.PROFILE_REJECTED:
        case NotificationType.BUSINESS_REGISTRATION_APPROVED:
        case NotificationType.BUSINESS_REGISTRATION_REJECTED:
            if (currentUserType === 'client') {
                if (item.type === NotificationType.BUSINESS_REGISTRATION_APPROVED) {
                    import('@config/authService').then(module => {
                        module.default.getClientProfile().then(res => {
                            if (res.success && res.data) {
                                import('@store/useUserStore').then(store => {
                                    store.useUserStore.getState().setClientProfile(res.data);
                                });
                            }
                        });
                    });
                }
                navigate('ClientProfileDetails');
            }
            break;

        case NotificationType.MATCH_CONFIRMED:
            if (dataId) {
                if (currentUserType === 'client') {
                    navigate('JobMatchDetails', { jobData: { _id: dataId, id: dataId } });
                } else if (currentUserType === 'contractor') {
                    navigate('MatchesDetails', { jobData: { _id: dataId, id: dataId } });
                }
            }
            break;

        case NotificationType.UPCOMING_JOB:
            if (dataId) {
                if (currentUserType === 'client') {
                    navigate('JobDetails', { job: { _id: dataId, id: dataId } });
                } else if (currentUserType === 'contractor') {
                    navigate('MyJobDetails', { job: { _id: dataId, id: dataId }, tab: 'Upcoming' });
                }
            }
            break;

        case NotificationType.KYC_REJECTED:
            if (currentUserType === 'contractor') {
                if (onShowKycPopup) {
                    onShowKycPopup();
                } else {
                    navigate('ReKyc');
                }
            }
            break;

        case NotificationType.INVITE_RESPONSE:
        case NotificationType.INVITATION_ACCEPTED:
            if (dataId && currentUserType === 'client') {
                navigate('JobInviteDetails', { invitationId: dataId });
            } else if (currentUserType === 'contractor') {
                navigate('InvitationDetails', { jobData: { _id: dataId, id: dataId } });
            }
            break;

        case NotificationType.JOB_COMPLETED:
            if (dataId) {
                if (currentUserType === 'client') {
                    navigate('JobDetails', { job: { _id: dataId, id: dataId }, tab: 'Completed' });
                } else if (currentUserType === 'contractor') {
                    navigate('MyJobDetails', { job: { _id: dataId, id: dataId }, tab: 'Completed' });
                }
            }
            break;
        case NotificationType.NEXT_HOUR_JOB_ALERT:
            if (dataId) {
                if (currentUserType === 'client') {
                    navigate('JobDetails', { job: { _id: dataId, id: dataId } });
                } else if (currentUserType === 'contractor') {
                    navigate('MyJobDetails', { job: { _id: dataId, id: dataId } });
                }
            }
            break;

        case NotificationType.WITHDRAWAL_APPROVED:
        case NotificationType.WITHDRAWAL_REJECTED:
            if (currentUserType === 'contractor') {
                navigate('Wallet');
            } else if (currentUserType === 'client') {
                navigate('TransactionHistory');
            }
            break;

        case NotificationType.CERTIFICATE_APPROVED:
        case NotificationType.CERTIFICATE_REJECTED:
            if (currentUserType === 'contractor') {
                navigate('Certifications');
            }
            break;


        case NotificationType.PAYMENT_INITIATED:
            if (dataId && currentUserType === 'contractor') {
                navigate('Wallet', { dataId });
            }
            break;

        case NotificationType.PENDING_RATING:
            if (currentUserType === 'client' && dataId) {
                navigate('JobDetails', { job: { _id: dataId, id: dataId }, JobStatus: JobStatus.COMPLETED });
            } else if (currentUserType === 'contractor') {
                import('@store/useUserStore').then(store => {
                    store.useUserStore.getState().setJobsActiveSegment('Completed');
                    store.useUserStore.getState().setContractorTabIndex(1);
                });
                navigationRef.reset({ index: 0, routes: [{ name: 'ContractorApp' as never }] });
            }
            break;

        case NotificationType.PROFILE_COMPLETION:
            if (dataId) {
                if (currentUserType === 'contractor') {
                    navigate('ProfileDetails', { dataId });
                } else {
                    navigate('ClientProfileDetails', { dataId });
                }
            }
            break;


        case NotificationType.RATE_PROPOSAL:
            if (dataId) {
                if (currentUserType === 'contractor') {
                    navigate('InvitationDetails', { jobData: { _id: dataId, id: dataId } });
                } else if (currentUserType === 'client') {
                    navigate('JobMatchDetails', { jobData: { _id: dataId, id: dataId } });
                }
            }
            break;

        case NotificationType.COUNTER_OFFER:
            if (dataId && currentUserType === 'client') {
                navigate('JobMatchDetails', { jobData: { _id: dataId, id: dataId } });
            } else if (dataId && currentUserType === 'contractor') {
                import('@store/useUserStore').then(store => {
                    store.useUserStore.getState().setContractorTabIndex(2);
                });
                if (navigationRef.isReady()) {
                    navigationRef.reset({ index: 0, routes: [{ name: 'ContractorApp' as never }] });
                }
            }
            break;

        case NotificationType.JOB_CANCELLED:
            if (dataId && currentUserType === 'client') {
                navigate('JobDetails', { job: { _id: dataId, id: dataId }, tab: 'Completed' });
            } else if (dataId && currentUserType === 'contractor') {
                navigate('MyJobDetails', { job: { _id: dataId, id: dataId }, tab: 'Completed' });
            }
            break;

        case NotificationType.SECURITY_ALERT:
            break;

        case NotificationType.APPLICATION_ACCEPTED:
            break;

        case NotificationType.APPLICATION_REJECTED:
            break;

        case NotificationType.ADD_MONEY_SUCCESS:
            if (currentUserType === 'client') {
                import('@store/useUserStore').then(store => {
                    store.useUserStore.getState().setClientTabIndex(3);
                });
                navigationRef.reset({ index: 0, routes: [{ name: 'ClientTabBar' as never }] });
            }
            break;

        case NotificationType.CONTRACTOR_CLOCK_OUT:
            if (dataId && currentUserType === 'contractor') {
                navigate('MatchesDetails', { jobData: { _id: dataId, id: dataId } });
            } else if (currentUserType === 'client') {
                navigate('JobAwaitingApproval');
            }
            break;

        case NotificationType.MATCH_REJECTED:
            break;

        case NotificationType.KYC_APPROVED:
        case NotificationType.KYC_UNDER_REVIEW:
        case NotificationType.ESCROW_CREDITED:
        default:
            devDebugger.log("not navigated to this", item);
            break;
    }
};

