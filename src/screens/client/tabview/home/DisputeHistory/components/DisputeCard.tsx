import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import { Toast } from '@utils/ToastManager';
import CopyableTransactionId from '@components/CopyableTransactionId';
import EvidenceSheetModal from '@components/EvidenceSheetModal';

interface DisputeCardProps {
    contractorName: string;
    transactionId: string;
    jobTitle: string;
    startDate: string;
    startTime: string;
    status: 'Settled by Admin' | 'Pending from Admin';
    onPress?: () => void;
    onViewAttachment?: () => void;
    evidenceList?: any[];
}

const DisputeCard: React.FC<DisputeCardProps> = ({
    contractorName,
    transactionId,
    jobTitle,
    startDate,
    startTime,
    status,
    onPress,
    onViewAttachment,
    evidenceList,
}) => {
    const [isSheetVisible, setIsSheetVisible] = React.useState(false);
    
    const isSettled = status === 'Settled by Admin';
    
    let parsedEvidence = evidenceList;
    if (typeof evidenceList === 'string') {
        try {
            const parsed = JSON.parse(evidenceList);
            if (Array.isArray(parsed)) parsedEvidence = parsed;
        } catch (e) {}
    }
    const evidenceArray = Array.isArray(parsedEvidence) ? parsedEvidence : (parsedEvidence ? [parsedEvidence] : []);
    const evidenceCount = evidenceArray.length;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.titleInfo}>
                <View style={styles.header}>
                    <AppText style={styles.name} numberOfLines={1}>{contractorName}</AppText>
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: isSettled ? colors.badgeGreen : colors.badgeAmber }
                    ]}>
                        <AppText style={[
                            styles.statusText, 
                            { color: isSettled ? colors.badgeGreenText : colors.bageDarkOrage }
                        ]}>
                            {status}
                        </AppText>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) }}>
                    <AppText style={[styles.transaction, { marginBottom: 0 }]}>{strings.client.disputes.disputeId} </AppText>
                    <CopyableTransactionId 
                        transactionId={transactionId} 
                        textStyle={[styles.transaction, { marginBottom: 0 }]} 
                    />
                </View>
                <AppText style={styles.jobTitle}>{jobTitle}</AppText>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Image source={require('@assets/images/common/calander.png')} style={styles.icon} />
                    <AppText style={styles.detailText}>{startDate}</AppText>
                </View>
                <View style={styles.detailItem}>
                    <Image source={require('@assets/images/common/blackClock.png')} style={styles.icon} />
                    <AppText style={styles.detailText}>{startTime}</AppText>
                </View>
            </View>

            {evidenceCount > 0 && (
                <TouchableOpacity
                    style={styles.attachmentBtn}
                    onPress={() => {
                        if (evidenceCount === 1) {
                            if (onViewAttachment) onViewAttachment();
                        } else {
                            setIsSheetVisible(true);
                        }
                    }}
                    activeOpacity={0.7}
                >
                    <Image source={require('@assets/images/common/attechments.png')} style={styles.attachmentIcon} />
                    <AppText style={styles.attachmentText}>
                        {`${strings.client.disputes.viewAttachment} (${evidenceCount})`}
                    </AppText>
                </TouchableOpacity>
            )}

            <EvidenceSheetModal
                visible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                evidences={evidenceArray}
                jobTitle={jobTitle}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    titleInfo: {
        marginBottom: verticalScale(12),
    },
    name: {
        flex: 1,
        flexShrink: 1,
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginRight: horizontalScale(10),
    },
    transaction: {
        fontSize: fontSize(13),
        fontFamily: fonts.light,
        color: '#888888',
        marginBottom: verticalScale(4),
    },
    jobTitle: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#888888',
    },
    statusBadge: {
        flexShrink: 0,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(8),
    },
    statusText: {
        fontSize: fontSize(12),
        fontFamily: fonts.semiBold,
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(20),
        marginBottom: verticalScale(16),
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        marginRight: horizontalScale(5),
        tintColor: '#9CA3AF',
    },
    detailText: {
        fontSize: fontSize(12),
        fontFamily: fonts.light,
        color: '#9CA3AF',
    },
    attachmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        paddingHorizontal: horizontalScale(14),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    attachmentIcon: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        marginRight: horizontalScale(8),
        tintColor: colors.primary,
    },
    attachmentText: {
        fontSize: fontSize(14),
        fontFamily: fonts.semiBold,
        color: colors.primary,
    },
    noAttachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(4),
    },
    noAttachmentText: {
        fontSize: fontSize(14),
        fontFamily: fonts.light,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});

export default DisputeCard;
