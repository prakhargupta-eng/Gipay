import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from './styles';
import colors from '@styles/colors';
import strings from '@constants/strings';
import AppText from '@components/AppText';

export interface Contractor {
  _id?: string;
  id?: string;
  contractorId?: string;
  fullName?: string;
  name?: string;
  jobTitle?: string;
  role?: string;
  workCategory?: string;
  hourlyRate?: number;
  profileImageUrl?: string;
  profilePicture?: string;
  image?: string;
  rating?: number;
  totalRatings?: number;
  skills?: string[];
  experience?: number;
}

interface ContractorCardProps {
  item: Contractor;
  onPress: (item: Contractor) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

const ContractorCard: React.FC<ContractorCardProps> = ({
  item,
  onPress,
  showCheckbox = false,
  isSelected = false,
  onToggle,
}) => {
  const profileImageUrl = item.profileImageUrl || item.profilePicture || item.image;
  const profileSource = profileImageUrl && profileImageUrl.trim() !== ""
    ? { uri: profileImageUrl }
    : require('@assets/images/common/dummyUser.png');

  const contractorName = item.fullName || item.name || `${item.fullName || ''} `.trim() || 'N/A';
  const contractorRole = item.jobTitle || item.role || item.workCategory || 'Contractor';
  const ratingValue = item.rating ? item.rating.toFixed(1) : '0.0';

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => onPress(item)}
      >
        <View style={styles.cardHeader}>
          <FastImage source={profileSource} style={styles.profileImg} />
          <View style={[styles.cardMainInfo, { flex: 1, paddingRight: 30 }]}>
            <AppText style={[styles.contractorName, { flexShrink: 1 }]} numberOfLines={1}>{contractorName}</AppText>
            <View style={styles.roleRatingRow}>
              <AppText style={[styles.contractorRole, { flexShrink: 1, paddingRight: 10 }]} numberOfLines={1}>{contractorRole}</AppText>
              {ratingValue !== '0.0' && (
                <>
                  <View style={styles.ratingDivider} />
                  <Image source={require('@assets/images/common/star.png')} style={styles.starIcon} />
                  <AppText style={styles.ratingText}>{ratingValue}</AppText>
                </>
              )}
            </View>
          </View>
          {showCheckbox && onToggle && (
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => onToggle(item.contractorId || item._id || item.id || '')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image 
                source={isSelected 
                  ? require('@assets/images/common/checkMark.png') 
                  : require('@assets/images/common/unCheck.png')} 
                style={styles.checkboxImage} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardDetailsRow}>
          <View style={styles.detailItem}>
            <Image source={require('@assets/images/common/doller.png')} style={styles.detailIcon} />
            <AppText style={styles.detailText} numberOfLines={1}>
              {strings.client.contractors.hourlyRate(item.hourlyRate || 0)}
            </AppText>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.detailItem}>
            <Image source={require('@assets/images/common/userstar.png')} style={styles.detailIcon} />
            <AppText style={styles.detailText} numberOfLines={1}> 
              {strings.client.contractors.experience(item.experience || 0)}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ContractorCard;
