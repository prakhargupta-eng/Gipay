import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import AppText from '@components/AppText';
import CustomTooltip from '@components/CustomTooltip';
import { openExternalMap } from '@utils/mapUtils';
import { getStatusStyles } from '@utils/statusUtils';
import { useSystemStore } from '@store/useSystemStore';
import { horizontalScale } from '@styles/mixins';
import { formatCurrency } from '@utils/currencyUtils';
interface JobCardProps {
  item: any;
  tab: 'Active' | 'Upcoming' | 'Completed';
  onPressAction?: (actionType: string, job: any) => void;
}

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList>;

const JobCard: React.FC<JobCardProps> = ({ item, tab, onPressAction }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleNavigationPress = () => {
    openExternalMap(
      item.latitude,
      item.longitude,
      item.address
    );
  };



  const disputeWindowHours = useSystemStore(state => state.settings?.disputeWindowHours) ?? 24;

  const canRaiseDispute = React.useMemo(() => {
    if (!item?.endDate) return true;

    const endDateTime = new Date(item.endDate);
    if (item.endTime) {
      const timeParts = item.endTime.match(/(\d+):(\d+) (AM|PM)/i);
      if (timeParts) {
        let hours = Number.parseInt(timeParts[1], 10);
        const minutes = Number.parseInt(timeParts[2], 10);
        const ampm = timeParts[3]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        endDateTime.setHours(hours, minutes, 0, 0);
      }
    }

    const hoursAfter = endDateTime.getTime() + (disputeWindowHours * 60 * 60 * 1000);
    return Date.now() <= hoursAfter;
  }, [item, disputeWindowHours]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{ width: '100%' }}
        onPress={() => navigation.navigate('MyJobDetails', { job: item, tab })}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <AppText style={styles.title} numberOfLines={1}>{item.jobTitle}</AppText>
          </View>
          <View style={[styles.badge, getStatusStyles(item.status).badge]}>
            <AppText style={[styles.badgeText, getStatusStyles(item.status).text]}>{getStatusStyles(item.status).label}</AppText>
          </View>
        </View>

        <AppText style={styles.companyText}>{item.companyName}</AppText>

        {/* Rating & Distance */}
        <View style={styles.ratingRow}>
          {(item.rating && item.rating !== '0' && item.rating !== '0.0' && parseFloat(item.rating) > 0) ? (
            <>
              <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
              <AppText style={styles.ratingText}>{item.rating} {item.distance ? <AppText style={styles.distanceText}>| {item.distance}</AppText> : null}</AppText>
            </>
          ) : item.distance ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('@assets/images/common/map.png')} style={[styles.starIcon, { tintColor: '#9CA3AF' }]} />
              <AppText style={styles.distanceText}>{item.distance}</AppText>
            </View>
          ) : null}
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <View style={styles.dateItem}>
            <Image source={require('@assets/images/common/calanderGray.png')} style={styles.iconSmall} />
            <AppText style={styles.infoText}>{item.dateRange}</AppText>
          </View>
          <View style={styles.dateItem}>
            <Image source={require('@assets/images/common/clockGray.png')} style={styles.iconSmall} />
            <AppText style={styles.infoText}>{item.timeRange}</AppText>
          </View>
        </View>

        {/* Job Rates */}
        <View style={styles.infoRow}>
          <Image source={require('@assets/images/common/doller.png')} style={styles.iconSmall} />
          <AppText style={[styles.infoText, item.proposedRate ? styles.strikethroughText : null]}>
            {strings.auth.contractor.home.jobRateLabel}{item.jobRate}/h
          </AppText>
          {item.proposedRate && (
            <AppText style={[styles.infoText, { marginLeft: 8 }]}>{strings.auth.contractor.home.nagotiontedRate} {formatCurrency(item.finalRate)}/h</AppText>
          )}
        </View>

        {/* Location */}
        <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
          <Image source={require('@assets/images/common/locationPin.png')} style={styles.iconSmall} />
          <AppText style={[styles.infoText, { marginRight: horizontalScale(20) }]} >{item.address}</AppText>
        </View>
      </TouchableOpacity>
      {/* Actions */}
      <View style={styles.actionsRow}>
        {tab === 'Active' && (() => {
          const isDisputeLeave = Boolean(item?.isDisputeLeave);
          const isClockedIn = isDisputeLeave ? false : Boolean(item.isClockedIn);
          const isClockDisabled = Boolean(isDisputeLeave || item.clockOutTime !== null || item.isCancelledJob);
          const isDisputeDisabled = Boolean(isDisputeLeave || item?.isAbleToDispute === false || !canRaiseDispute);

          return (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={handleNavigationPress}>
                <Image source={require('@assets/images/common/navigation.png')} style={[styles.actionIcon, { width: 18, height: 18 }]} />
                <AppText style={styles.actionText}>{strings.auth.contractor.home.navigation}</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, isDisputeDisabled && { opacity: 0.5 }]} 
                onPress={() => !isDisputeDisabled && onPressAction?.('dispute', item)}
                disabled={isDisputeDisabled}
              >
                <Image source={require('@assets/images/common/error.png')} style={[styles.actionIcon, isDisputeDisabled && { tintColor: colors.gray }]} />
                <AppText style={[styles.actionText, isDisputeDisabled && { color: colors.gray }]}>{strings.auth.contractor.home.raiseDispute}</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, isClockDisabled && { opacity: 0.5 }]}
                onPress={() => !isClockDisabled && onPressAction?.(isClockedIn ? 'clockOut' : 'clockIn', item)}
                disabled={isClockDisabled}
              >
                <Image source={require('@assets/images/common/blackClock.png')} style={[styles.actionIcon, (item.clockedOut === null || isClockDisabled) && { tintColor: colors.gray }]} />
                <AppText style={[styles.actionText, (item.clockedOut === null || isClockDisabled) && { color: colors.gray }]}>
                  {isClockedIn ? strings.auth.contractor.home.clockOut : strings.auth.contractor.home.clockIn}
                </AppText>
              </TouchableOpacity>
            </>
          );
        })()}

        {tab === 'Upcoming' && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleNavigationPress}>
            <Image source={require('@assets/images/common/navigation.png')} style={styles.actionIcon} />
            <AppText style={styles.actionText}>{strings.auth.contractor.home.navigation}</AppText>
          </TouchableOpacity>
        )}

        {tab === 'Completed' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, (item?.isRatingClient === true || item?.status?.toLowerCase() === 'expired') && { opacity: 0.5 }]}
              onPress={() => item?.isRatingClient !== true && item?.status?.toLowerCase() !== 'expired' && onPressAction?.('rateClient', item)}
              disabled={item?.isRatingClient === true || item?.status?.toLowerCase() === 'expired'}
            >
              <Image source={require('@assets/images/common/rate.png')} style={styles.actionIcon} />
              <AppText style={styles.actionText}>{strings.auth.contractor.home.rateClient}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, (item?.isAbleToDispute === false || !canRaiseDispute) && { opacity: 0.5 }]}
              onPress={() => (canRaiseDispute && item?.isAbleToDispute !== false) && onPressAction?.('dispute', item)}
              disabled={item?.isAbleToDispute === false || !canRaiseDispute}
            >
              <Image source={require('@assets/images/common/error.png')} style={styles.actionIcon} />
              <AppText style={styles.actionText}>{strings.auth.contractor.home.raiseDispute}</AppText>
            </TouchableOpacity>
            <View style={{ position: 'relative', zIndex: 10 }}>
              <TouchableOpacity style={styles.infoBtn} onPress={() => setShowTooltip(!showTooltip)}>
                <Image source={require('@assets/images/common/info.png')} style={styles.infoIcon} />
              </TouchableOpacity>

              <CustomTooltip
                visible={showTooltip}
                text={strings.auth.contractor.home.disputeTooltipLimit(disputeWindowHours)}
                onClose={() => setShowTooltip(false)}
              />
            </View>
          </>
        )}
      </View>

    </View>
  );
};

export default JobCard;
