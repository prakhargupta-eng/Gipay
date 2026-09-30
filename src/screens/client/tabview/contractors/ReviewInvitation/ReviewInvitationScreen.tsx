import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    ScrollView,
    Modal,
    TouchableOpacity,
} from 'react-native';

import TopHeader from '@components/TopHeader';
import CustomButton from '@components/CustomButton';
import AppText from '@components/AppText';
import LottieView from 'lottie-react-native';
import styles from './styles';
import strings from '@constants/strings';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import JobService from '@config/jobService';
import { useUserStore } from '@store/useUserStore';
import SkeletonFrame from '@components/SkeletonFrame';
import { Toast } from '@utils/ToastManager';
import colors from '@styles/colors';
import { devDebugger } from '@utils/devDebugger';

const defaultInvitationData = [
    {
        id: 'willReceiveInvitation',
        title: strings.client.reviewInvitation.willReceiveInvitation,
        description: strings.client.reviewInvitation.willReceiveInvitationDesc,
        count: 0,
        icon: require('@assets/images/common/userCheck.png'),
        color: '#1B00A6',
        bgColor: '#EDE9FF',
    },
    {
        id: 'alreadyInvited',
        title: strings.client.reviewInvitation.alreadyInvited,
        description: strings.client.reviewInvitation.alreadyInvitedDesc,
        count: 0,
        icon: require('@assets/images/common/mailOpened.png'),
        color: '#1B00A6',
        bgColor: '#EDE9FF',
    },
    {
        id: 'notEligible',
        title: strings.client.reviewInvitation.notEligible,
        description: strings.client.reviewInvitation.notEligibleDesc,
        count: 0,
        icon: require('@assets/images/common/userX.png'),
        color: '#1B00A6',
        bgColor: '#EDE9FF',
    },
];

type ModalState = 'confirm' | 'success';

const ReviewInvitationScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalState, setModalState] = useState<ModalState>('confirm');
    const [loading, setLoading] = useState(false);

    const [listsData, setListsData] = useState({
        willReceiveInvitation: [] as any[],
        alreadyInvited: [] as any[],
        notEligible: [] as any[],
    });
    const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

    // Summary Data State
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [summaryCounts, setSummaryCounts] = useState({
        willReceiveInvitation: 0,
        alreadyInvited: 0,
        notEligible: 0,
        totalSelected: 0
    });

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { payload, summaryPayload, job } = route.params || {};

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setIsLoadingSummary(true);
                const response = await JobService.getInvitationSummary(summaryPayload);
                const data = response.data || {};
                if (response.success && data) {
                    const getCount = (val: any) => Array.isArray(val) ? val.length : (typeof val === 'number' ? val : 0);

                    setListsData({
                        willReceiveInvitation: Array.isArray(data.willReceiveInvitation) ? data.willReceiveInvitation : [],
                        alreadyInvited: Array.isArray(data.alreadyInvited) ? data.alreadyInvited : [],
                        notEligible: Array.isArray(data.notEligible) ? data.notEligible : [],
                    });

                    setSummaryCounts({
                        willReceiveInvitation: getCount(data.willReceiveInvitation),
                        alreadyInvited: getCount(data.alreadyInvited),
                        notEligible: getCount(data.notEligible),
                        totalSelected: getCount(data.totalSelected) ||
                            (getCount(data.willReceiveInvitation) + getCount(data.alreadyInvited) + getCount(data.notEligible)),
                    });
                } else {
                    Toast.show({ type: 'error', text2: response.message || strings.client.reviewInvitation.failedToFetchSummary });
                }
            } catch (error: any) {
                devDebugger.error(error);
                Toast.show({ type: 'error', text2: error.message || strings.client.reviewInvitation.somethingWentWrong });
            } finally {
                setIsLoadingSummary(false);
            }
        };

        fetchSummary();
    }, [payload]);

    const onReviewPress = () => {
        setModalState('confirm');
        setModalVisible(true);
    };


    const sendInvitation = async () => {
        try {
            setLoading(true);

            // Actual API call to send invitations
            const response = await JobService.inviteContractorToJobs(payload);
            if (response.success) {
                setModalVisible(false);
                Toast.show({
                    type: 'success',
                    text1: strings.client.reviewInvitation.invitationSent,
                    text2: response.message || strings.client.reviewInvitation.invitationSentSuccess
                });
                
                setTimeout(() => {
                    useUserStore.getState().setClientTabIndex(1);
                    navigation.navigate('ClientTabBar');
                }, 300);
            } else {
                Toast.show({ type: 'error', text2: response.message || strings.client.reviewInvitation.failedToSendInvitation });
                setModalVisible(false);
            }

        } catch (error: any) {
            devDebugger.log(error);
            Toast.show({ type: 'error', text2: error.message || strings.client.reviewInvitation.somethingWentWrong });
            setModalVisible(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        setModalVisible(false);
        setModalState('confirm');
        navigation.pop(2); // Go back to Home or Contracters list
    };

    const invitationData = defaultInvitationData.map(item => ({
        ...item,
        count: summaryCounts[item.id as keyof typeof summaryCounts] || 0
    }));

    return (
        <View style={styles.container}>
            <TopHeader title={strings.client.reviewInvitation.screenTitle} onBack={() => { navigation.goBack() }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {isLoadingSummary ? (
                    <View style={styles.summaryWrapper}>
                        <View style={styles.jobCard}>
                            <SkeletonFrame width={60} height={60} borderRadius={12} style={{ marginRight: 16 }} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <SkeletonFrame width="70%" height={20} />
                                <SkeletonFrame width="50%" height={16} />
                                <SkeletonFrame width="60%" height={16} />
                            </View>
                        </View>

                        <SkeletonFrame width="50%" height={20} style={{ marginVertical: 16 }} />

                        {[1, 2, 3].map(k => (
                            <View key={k} style={styles.summaryCard}>
                                <View style={styles.leftContent}>
                                    <SkeletonFrame width={42} height={42} borderRadius={21} style={{ marginRight: 12 }} />
                                    <View style={{ gap: 6, flex: 1 }}>
                                        <SkeletonFrame width="80%" height={16} />
                                        <SkeletonFrame width="60%" height={14} />
                                    </View>
                                </View>
                                <SkeletonFrame width={24} height={24} />
                            </View>
                        ))}

                        <View style={styles.totalContainer}>
                            <SkeletonFrame width="40%" height={20} />
                            <SkeletonFrame width={30} height={20} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.summaryWrapper}>
                        <View style={styles.jobCard}>

                            <View style={styles.jobInfo}>
                                <AppText style={styles.jobTitle} numberOfLines={1}>{job?.jobTitle || job?.title || ''}</AppText>
                                <AppText style={styles.jobSubTitle}>{job?.organizationName || job?.company || ''}</AppText>
                            </View>
                        </View>

                        <AppText style={styles.sectionTitle}>{strings.client.reviewInvitation.invitationSummary}</AppText>

                        {invitationData.map(item => {
                            const hasData = listsData[item.id as keyof typeof listsData]?.length > 0;
                            return (
                                <TouchableOpacity
                                    key={item.title}
                                    style={styles.summaryCard}
                                    activeOpacity={0.7}
                                    disabled={!hasData}
                                    onPress={() => setSelectedSheetId(item.id)}
                                >
                                    <View style={styles.leftContent}>
                                        <View
                                            style={[
                                                styles.iconCircle,
                                                { borderColor: item.color, backgroundColor: item.bgColor || `${item.color}15` },
                                            ]}
                                        >
                                            <Image
                                                source={item.icon}
                                                style={[styles.icon, { tintColor: item.color }]}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <AppText style={styles.cardTitle}>
                                                {item.title} ({item.count})
                                            </AppText>
                                            <AppText style={styles.cardDescription}>{item.description}</AppText>
                                        </View>
                                    </View>
                                    <Image
                                        source={require('@assets/images/common/backIcon.png')}
                                        style={{ width: 16, height: 16, tintColor: item.color, transform: [{ rotate: '180deg' }] }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.totalContainer}>
                            <AppText style={styles.totalLabel}>{strings.client.reviewInvitation.totalSelected}</AppText>
                            <AppText style={styles.totalValue}>{summaryCounts.totalSelected}</AppText>
                        </View>
                    </View>
                )}

                <View style={styles.noteContainer}>
                    <Image source={require('@assets/images/common/info.png')} style={styles.noteIcon} />
                    <AppText style={styles.noteText}>
                        <AppText style={styles.noteBold}>{strings.client.reviewInvitation.notePrefix}</AppText>
                        {strings.client.reviewInvitation.noteContent}
                    </AppText>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <CustomButton title={strings.client.reviewInvitation.reviewAndSendBtn} onPress={onReviewPress} />
            </View>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>

                        {modalState === 'confirm' ? (
                            <>
                                {/* Free Lottie - no clipping circles */}
                                <LottieView
                                    source={require('@assets/animation/send.json')}
                                    style={styles.successImage}
                                    autoPlay
                                    loop
                                />

                                <AppText style={styles.modalTitle}>{strings.client.reviewInvitation.sendInvitationConfirmTitle}</AppText>

                                <AppText style={[styles.modalDescription, { marginBottom: 16 }]}>
                                    {summaryCounts.willReceiveInvitation}{strings.client.reviewInvitation.willReceivePrefix}
                                    <AppText style={styles.modalJobName}>{job?.jobTitle || job?.title || ''}</AppText>
                                </AppText>

                                {[
                                    { label: strings.client.reviewInvitation.willReceiveInvitation, count: summaryCounts.willReceiveInvitation, icon: require('@assets/images/common/userCheck.png') },
                                    { label: strings.client.reviewInvitation.alreadyInvited, count: summaryCounts.alreadyInvited, icon: require('@assets/images/common/mailOpened.png') },
                                    { label: strings.client.reviewInvitation.notEligible, count: summaryCounts.notEligible, icon: require('@assets/images/common/userX.png') },
                                ].map(item => (
                                    <View
                                        key={item.label}
                                        style={[styles.statusCard, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }]}
                                    >
                                        <View style={styles.statusLeft}>
                                            <View style={[styles.iconCircle, { width: 36, height: 36, borderRadius: 18, borderColor: colors.primary, marginRight: 12 }]}>
                                                <Image
                                                    source={item.icon}
                                                    style={{ width: 18, height: 18, tintColor: colors.primary }}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <AppText style={[styles.statusLabel, { color: '#111827' }]}>
                                                {item.label}
                                            </AppText>
                                        </View>
                                        <AppText style={[styles.statusCount, { color: colors.primary }]}>
                                            {item.count}
                                        </AppText>
                                    </View>
                                ))}

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setModalVisible(false)}
                                        disabled={loading}
                                    >
                                        <AppText style={styles.cancelText}>{strings.client.reviewInvitation.cancel}</AppText>
                                    </TouchableOpacity>

                                    <CustomButton
                                        title={strings.client.reviewInvitation.yesSend}
                                        onPress={sendInvitation}
                                        loading={loading}
                                        style={{ flex: 1, marginLeft: 6, height: 48, borderRadius: 10 }}
                                    />
                                </View>
                            </>
                        ) : (
                            <>

                                {/* Free Lottie - no clipping circles */}
                                <LottieView
                                    source={require('@assets/animation/Success Check.json')}
                                    style={styles.successImage}
                                    autoPlay
                                    loop={false}
                                />

                                <AppText style={styles.modalTitle}>{strings.client.reviewInvitation.invitationsSentSuccessTitle}</AppText>

                                <AppText style={[styles.modalDescription, { marginBottom: 16 }]}>
                                    {summaryCounts.willReceiveInvitation}{strings.client.reviewInvitation.haveBeenInvitedPrefix}
                                    <AppText style={styles.modalJobName}>{job?.jobTitle || job?.title || ''}</AppText>
                                </AppText>
                                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                                    <AppText style={styles.doneText}>{strings.client.reviewInvitation.done}</AppText>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                </View>
            </Modal>

            {/* Bottom Sheet for Invited Contractors */}
            <Modal visible={!!selectedSheetId} transparent animationType="slide" onRequestClose={() => setSelectedSheetId(null)}>
                <TouchableOpacity
                    style={[styles.overlay, styles.bottomSheetOverlay]}
                    activeOpacity={1}
                    onPress={() => setSelectedSheetId(null)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.modalContainer, styles.bottomSheetContainer]}
                    >
                        <View style={styles.bottomSheetHeader}>
                            <AppText style={styles.modalTitle}>
                                {selectedSheetId === 'alreadyInvited' ? strings.client.reviewInvitation.alreadyInvited :
                                    selectedSheetId === 'notEligible' ? strings.client.reviewInvitation.notEligible :
                                    strings.client.reviewInvitation.willReceiveInvitation}
                            </AppText>
                            <TouchableOpacity onPress={() => setSelectedSheetId(null)} style={styles.closeButtonSmall}>
                                <Image source={require('@assets/images/common/closeIcon.png')} style={styles.closeIconSmall} resizeMode="contain" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
                            {selectedSheetId && listsData[selectedSheetId as keyof typeof listsData]?.map((c: any, i: number) => (
                                <View key={i} style={styles.bottomSheetItem}>
                                    <FastImage
                                        source={c.profileImageUrl ? { uri: c.profileImageUrl } : require('@assets/images/common/dummyUser.png')}
                                        style={styles.bottomSheetAvatar}
                                    />
                                    <View style={styles.bottomSheetItemInfo}>
                                        <AppText style={styles.bottomSheetItemName}>{c.fullName || strings.client.reviewInvitation.contractor}</AppText>
                                        <AppText style={styles.bottomSheetItemCategory}>{c.workCategory || strings.client.reviewInvitation.contractor}</AppText>
                                    </View>
                                </View>
                            ))}
                            <View style={styles.bottomSheetSpacer} />
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default ReviewInvitationScreen;