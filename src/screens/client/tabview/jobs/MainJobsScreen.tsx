import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from '@components/LinearGradient';

import TopHeader from '@components/TopHeader';
import SegmentedControl from '@components/SegmentedControl';
import ActiveJobsScreen from './active/ActiveJobsScreen';
import UpcomingJobsScreen from './upcoming/UpcomingJobsScreen';
import CompletedJobsScreen from './completed/CompletedJobsScreen';

import styles from './active/styles'; // Reusing base styles
import strings from '@constants/strings';
import colors from '@styles/colors';
import { useUserStore } from '@store/useUserStore';
import { Toast } from '@utils/ToastManager';
import AuthService from '@config/authService';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const MainJobsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const { clientProfile, setClientProfile, isClientRestricted, jobsActiveSegment, setJobsActiveSegment } = useUserStore();

  const verificationStatus = clientProfile?.profile?.businessRegistrationDocument?.verificationStatus?.toLowerCase();
  const isApproved = verificationStatus === 'approved';

  const fetchProfile = async () => {
    try {
      const response = await AuthService.getClientProfileInfo();
      if (response.success) {
        setClientProfile(response.data);
      }
    } catch (error) {
      devDebugger.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = () => {
    if (isClientRestricted()) {
      Toast.show({
        type: 'info',
        text2: strings.client.home.accountVerificationInProgress,
        duration: 4500
      });
      return;
    }
    navigation.navigate('CreateJob');
  };

  const renderContent = () => {
    switch (jobsActiveSegment) {
      case 'Active':
        return <ActiveJobsScreen />;
      case 'Upcoming':
        return <UpcomingJobsScreen />;
      case 'Completed':
        return <CompletedJobsScreen />;
      default:
        return <ActiveJobsScreen />;
    }
  };

  useEffect(() => {

    if (clientProfile && !isApproved) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [isApproved])

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <TopHeader title={strings.client.jobs.screenTitle} hideBackButton />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <SegmentedControl
            options={['Active', 'Upcoming', 'Completed']}
            onSelect={(val) => setJobsActiveSegment(val)}
            initialOption={jobsActiveSegment}
          />
        </View>

        <View style={{ flex: 1 }}>
          {renderContent()}
        </View>

      </View>
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButtonContainer}
        onPress={handleCreateJob}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.floatingButtonGradient}
        >
          <Image source={require('@assets/images/common/plus.png')} style={styles.addIcon} />
          <AppText style={styles.addJobText}>{strings.client.jobs.addJob}</AppText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default MainJobsScreen;
