import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Fonts from '@assets/Fonts';
import Colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';
import { getStatusStyles, formatTransactionType } from '@utils/statusUtils';
import colors from '@styles/colors';  
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

interface PaymentItemProps {
  jobTitle: string;
  personName: string;
  timeAgo: string;
  amount: string;
  status: PaymentStatus;
  avatarInitials: string;
  avatarColor?: string;
  profileImage?: string;
  onPress?: () => void;
  transactionType?: string;
  type?: string;
}




const PaymentItem: React.FC<PaymentItemProps> = ({
  jobTitle,
  personName,
  timeAgo,
  amount,
  status,
  avatarInitials,
  avatarColor = Colors.lightPurple,
  profileImage,
  onPress,
  transactionType,
  type,
}) => {
  const [imageError, setImageError] = React.useState(false);
    const statusStyle = getStatusStyles(status);

    let displayTransactionType = '';
    if (transactionType) {
        displayTransactionType = formatTransactionType(transactionType);
    } else if (type) {
        displayTransactionType = type.charAt(0).toUpperCase() + type.slice(1);
    }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {profileImage && !imageError ? (
        <Image
          source={{ uri: profileImage }}
          style={styles.avatar}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <AppText style={styles.avatarText}>{avatarInitials}</AppText>
        </View>
      )}

      <View style={styles.infoContainer}>
        <AppText style={styles.jobTitle} numberOfLines={1}>
          {jobTitle}
        </AppText>
        {personName ? (
          <View style={styles.subtitleRow}>
            <AppText style={[styles.subtitle, { flexShrink: 1 }]} numberOfLines={1}>
              {personName}
            </AppText>
            <AppText style={styles.subtitleAgo} numberOfLines={1}>
              {`  |  ${timeAgo}`}
            </AppText>
          </View>
        ) : (
          <AppText style={styles.subtitle} numberOfLines={1}>
            {timeAgo}
          </AppText>
        )}
        {displayTransactionType ? (
          <AppText style={styles.transactionType} numberOfLines={1}>
            {displayTransactionType}
          </AppText>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.amountRow}>
          {type === 'credit' && (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path d="M12 5V19M12 19L5 12M12 19L19 12" stroke={Colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
          {type === 'debit' && (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path d="M12 19V5M12 5L5 12M12 5L19 12" stroke={Colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
          <AppText style={styles.amount}>{amount}</AppText>
        </View>
        <View style={[styles.statusBadge, statusStyle.badge]}>
          <AppText style={[styles.status,  statusStyle.text ]}>{getStatusStyles(status).label}</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.statBorder,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  avatar: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(14),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: fontSize(15),
    fontFamily: Fonts.bold,
    color: Colors.avatarText,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: fontSize(15),
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: fontSize(12),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: fontSize(11),
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginTop: verticalScale(4),
  },
  subtitleAgo: {
    fontSize: fontSize(12),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: horizontalScale(8),
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  amount: {
    fontSize: fontSize(17),
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  arrowIcon: {
    width: horizontalScale(14),
    height: horizontalScale(14),
    marginRight: horizontalScale(4),
    resizeMode: 'contain',
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(2),
    borderRadius: 6,
  },
  status: {
    fontSize: fontSize(11),
    fontFamily: Fonts.bold,
  },
});

export default PaymentItem;
