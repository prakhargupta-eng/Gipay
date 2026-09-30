import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@utils/currencyUtils';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Toast } from '@utils/ToastManager';

import JobService from '@config/jobService';
import TopHeader from '@components/TopHeader';
import SkeletonFrame from '@components/SkeletonFrame';
import { getCloudFrontUrl } from '@utils/awsUploadHelper';

import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import colors from '@styles/colors';
import strings from '@constants/strings';
import styles from './styles';
import { horizontalScale, verticalScale } from '@styles/mixins';
import { getFileIcon } from '@utils/fileUtils';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import { devDebugger } from '@utils/devDebugger';

type ContractorProfileDetailRouteProp = RouteProp<ClientAppStackParamList, 'ContractorProfileDetail'>;

interface Certification {
  certificateId: string;
  name: string;
  type: string;
  url: string;
  verificationStatus: string;
  validityPeriodInMonths: number;
}

interface ContractorDetail {
  _id: string;
  contractorId: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  workCategory: string;
  profileImageUrl: string;
  bio: string;
  experience: number;
  hourlyRate: number;
  availabilityDays: string[];
  skills: string[];
  workCategories: string[];
  dateOfBirth: string;
  email: string;
  mobile?: string;
  phoneNumber?: string;
  certifications: Certification[];
  resumeUrl: string;
  rating: number;
  jobTitle?: string;
}

const ContractorProfileDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ContractorProfileDetailRouteProp>();
  const { contractor } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [data, setData] = useState<ContractorDetail | null>(null);

  const jobId = route.params?.jobId;
  const shouldShowButton = route.params?.shouldShowButton;

  useEffect(() => {
    if (contractor?.contractorId) {
      fetchDetail();
    } else {
      setIsLoading(false);
    }
  }, [contractor]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const response = await JobService.getContractorDetail(contractor?.contractorId);
      if (response.success) {
        setData(response.data);
      } else {
        setHasError(true);
        Toast.show({
          type: 'error',
          text1: strings.common.error,
          text2: response.message || strings.client.contractorProfile.detailsNotFound,
        });
      }
    } catch (error) {
      devDebugger.error('Error fetching contractor detail:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeleton = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.headerInfo}>
        <SkeletonFrame width={horizontalScale(100)} height={horizontalScale(100)} borderRadius={horizontalScale(50)} />
        <SkeletonFrame width={horizontalScale(180)} height={verticalScale(24)} style={{ marginTop: verticalScale(16) }} />
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(18)} style={{ marginTop: verticalScale(8) }} />
        <SkeletonFrame width="90%" height={verticalScale(40)} style={{ marginTop: verticalScale(12) }} />
      </View>

      {/* Experience & Rate Boxes */}
      <View style={styles.statsRow}>
        <SkeletonFrame width="48%" height={verticalScale(85)} borderRadius={16} />
        <SkeletonFrame width="48%" height={verticalScale(85)} borderRadius={16} />
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <SkeletonFrame width={horizontalScale(120)} height={verticalScale(20)} style={{ marginBottom: verticalScale(16) }} />
        <View style={styles.availabilityContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <SkeletonFrame key={i} width="30%" height={horizontalScale(34)} borderRadius={horizontalScale(17)} />
          ))}
        </View>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <SkeletonFrame width={horizontalScale(100)} height={verticalScale(20)} style={{ marginBottom: verticalScale(16) }} />
        <View style={styles.tagContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonFrame key={i} width={horizontalScale(80)} height={verticalScale(34)} borderRadius={horizontalScale(17)} />
          ))}
        </View>
      </View>

      {/* Work Categories */}
      <View style={styles.section}>
        <SkeletonFrame width={horizontalScale(140)} height={verticalScale(20)} style={{ marginBottom: verticalScale(16) }} />
        <View style={styles.tagContainer}>
          {[1, 2].map((i) => (
            <SkeletonFrame key={i} width={horizontalScale(100)} height={verticalScale(34)} borderRadius={horizontalScale(17)} />
          ))}
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <SkeletonFrame width={horizontalScale(130)} height={verticalScale(20)} style={{ marginBottom: verticalScale(16) }} />
        <SkeletonFrame width="100%" height={verticalScale(120)} borderRadius={12} />
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <SkeletonFrame width={horizontalScale(110)} height={verticalScale(20)} style={{ marginBottom: verticalScale(16) }} />
        <SkeletonFrame width="100%" height={verticalScale(80)} borderRadius={12} style={{ marginBottom: verticalScale(100) }} />
      </View>
    </ScrollView>
  );

  if (isLoading) return (
    <View style={styles.safeArea}>
      <TopHeader title={strings.client.contractorProfile.screenTitle} onBack={() => navigation.goBack()} />
      {renderSkeleton()}
    </View>
  );

  const displayData = data;

  // Check if data is essentially empty (e.g. only contains contractorId but no meaningful profile data)
  const isEssentiallyEmpty = hasError ||!displayData || (!displayData.fullName  && !displayData.email && !displayData.mobile);

  if (isEssentiallyEmpty) return (
    <View style={styles.safeArea}>
      <TopHeader title={strings.client.contractorProfile.screenTitle} onBack={() => navigation.goBack()} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          imageSource={require('@assets/images/common/noData.png')}
          title={strings.client.contractorProfile.detailsNotFound}
          description="Could not load the profile details for this contractor."
        />
      </View>
    </View>
  );

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      devDebugger.warn('Error formatting date string:', error);
      return dateStr;
    }
  };

  const openWebView = (url: string, title: string) => {
    if (url) {
      navigation.navigate('WebView', { url: getCloudFrontUrl(url), title });
    }
  };

  const handleInvite = async () => {
    navigation.navigate('SelectJob', { contractor: displayData });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <TopHeader title={strings.client.contractorProfile.screenTitle} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.headerInfo}>
          <View style={styles.imageWrapper}>
            <FastImage
              source={displayData.profileImageUrl ? { uri: displayData.profileImageUrl } : require('@assets/images/common/dummyUser.png')}
              style={styles.profileImg}
            />
          </View>
          <AppText style={styles.name}numberOfLines={1}>{displayData.fullName}</AppText>
          <AppText style={styles.role}>{displayData.workCategory }</AppText>
          <AppText style={styles.bio}>{displayData.bio}</AppText>
        </View>

        {/* Experience & Rate Boxes */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <AppText style={styles.statValue}>{displayData.experience || '0'}y</AppText>
            <AppText style={styles.statLabel}>{strings.client.contractorProfile.experience}</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText style={styles.statValue}>{formatCurrency(displayData.hourlyRate || '0')}</AppText>
            <AppText style={styles.statLabel}>{strings.client.contractorProfile.hourlyRate}</AppText>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.availability}</AppText>
          <View style={styles.availabilityContainer}>
            {[
              { label: 'Mon', full: 'Monday' },
              { label: 'Tue', full: 'Tuesday' },
              { label: 'Wed', full: 'Wednesday' },
              { label: 'Thu', full: 'Thursday' },
              { label: 'Fri', full: 'Friday' },
              { label: 'Sat', full: 'Saturday' },
              { label: 'Sun', full: 'Sunday' },
            ].map(day => {
              const isAvailable = displayData.availabilityDays?.includes(day.full) || displayData.availabilityDays?.includes(day.label);
              return (
                <View key={day.label} style={[styles.dayTag, isAvailable && styles.dayTagActive]}>
                  <AppText style={[styles.dayTagText, isAvailable && styles.dayTagTextActive]}>{day.label}</AppText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.skills}</AppText>
          <View style={styles.tagContainer}>
            {displayData.skills?.map((skill: string) => (
              <View key={skill} style={styles.skillTag}>
                <AppText style={styles.skillTagText}>{skill}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Work Categories */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.workCategories}</AppText>
          <View style={styles.tagContainer}>
            {(displayData.workCategories || [displayData.workCategory])?.filter(Boolean).map((cat: string) => (
              <View key={cat} style={styles.skillTag}>
                <AppText style={styles.skillTagText}>{cat}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.personalInfo}</AppText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Image source={require('@assets/images/common/clanderBlue.png')} style={styles.infoIcon} />
              </View>
              <View>
                <AppText style={styles.infoLabel}>{strings.client.contractorProfile.dateOfBirth}</AppText>
                <AppText style={styles.infoValue}>{formatDateString(displayData.dateOfBirth)}</AppText>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoIconBox}>
                <Image source={require('@assets/images/common/email.png')} style={styles.infoIcon} />
              </View>
              <View>
                <AppText style={styles.infoLabel}>{strings.client.contractorProfile.email}</AppText>
                <AppText style={styles.infoValue}>{displayData.email || 'N/A'}</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.certifications}</AppText>
          <View style={styles.infoCard}>
            {(displayData.certifications && displayData.certifications.length > 0) ? (
              displayData.certifications.map((cert: any, index: number) => (
                <View key={index} style={styles.certRow}>
                  <AppText style={styles.bullet}>•</AppText>
                  <View>
                    <AppText style={styles.certText}>
                      {typeof cert === 'object' ? cert.name : cert}
                    </AppText>
                  </View>
                </View>
              ))
            ) : (
              <AppText style={styles.certText}>{strings.client.contractorProfile.noCertifications}</AppText>
            )}
          </View>
        </View>

        {/* Professional License */}
        {displayData.resumeUrl && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{strings.client.contractorProfile.professionalLicense}</AppText>
            <View style={styles.licenseBox}>
              <Image source={getFileIcon(displayData.resumeUrl)} style={styles.pdfIcon} />
              <AppText style={styles.licenseText} numberOfLines={1} ellipsizeMode="tail">
                {displayData.resumeUrl ? displayData.resumeUrl.split('/').pop() : strings.client.contractorProfile.noLicense}
              </AppText>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.viewCvBtn, { width: jobId || !shouldShowButton ? '100%' : '49%' }]}
          onPress={() => {
            if (!displayData.resumeUrl) {
              Toast.show({ type: 'info', text2: strings.client.contractorProfile.resumeNotUploaded });
            } else {
              openWebView(displayData.resumeUrl, 'Resume');
            }
          }}
        >
          <AppText style={styles.viewCvText}>{strings.client.contractorProfile.viewCv}</AppText>
        </TouchableOpacity>
        {!jobId && shouldShowButton && (
          <TouchableOpacity
            style={[styles.inviteBtn, isInviting && { opacity: 0.6 }]}
            onPress={handleInvite}
            disabled={isInviting}
          >
            {isInviting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <AppText style={styles.inviteText}>{strings.client.contractorProfile.invite}</AppText>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ContractorProfileDetailScreen;
