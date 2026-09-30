import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Toast } from '@utils/ToastManager';
import JobService from '@config/jobService';
import colors from '@styles/colors';

import TopHeader from '@components/TopHeader';
import DropdownField from '@components/DropdownField';
import strings from '@constants/strings';
import styles from './styles';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

const ManualClockInScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { job } = route.params || {};
  
  const [selectedContractor, setSelectedContractor] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingContractors, setIsFetchingContractors] = useState(true);
  const [contractorOptions, setContractorOptions] = useState<{ label: string, value: string }[]>([]);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const jobStartDate = useMemo(() => {
    if (!job?.startDate) return new Date();
    
    let date = new Date(job.startDate);
    if (isNaN(date.getTime())) {
      date = new Date();
    }


    
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    return date;
  }, [job]);

  const [selectedTimeDate, setSelectedTimeDate] = useState(jobStartDate);

  useEffect(() => {
    fetchEligibleContractors();
  }, []);

  const fetchEligibleContractors = async () => {
    try {
      setIsFetchingContractors(true);
      const res = await JobService.getClockInEligibleContractors(job.id);
      if (res.success && res.data) {
        const formatted = (res.data || []).map((c: any) => ({
          label:   c.name || 'Unknown',
          value: c.id || c._id || c.contractorId
        }));
        setContractorOptions(formatted);
      }
    } catch (error) {
      devDebugger.error('Error fetching contractors:', error);
    } finally {
      setIsFetchingContractors(false);
    }
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  const handleConfirm = async () => {
    if (!selectedContractor) {
        Toast.show({ type: 'error', text2: 'Please select a contractor' });
        return;
    }
    if (!clockInTime) {
        Toast.show({ type: 'error', text2: 'Please enter clock-in time' });
        return;
    }

    try {
        setIsLoading(true);
        const payload = {
            contractorId: selectedContractor,
            clockInTime: clockInTime
        };
        const response = await JobService.manualClockIn(job.id, payload);
        if (response.success) {
            Toast.show({ type: 'success', text2: 'Clock-in confirmed successfully' });
            navigation.goBack();
        } else {
            Toast.show({ type: 'error', text2: response.message || 'Failed to confirm clock-in' });
        }
    } catch (error: any) {
        Toast.show({ type: 'error', text2: error.message || 'Something went wrong' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <TopHeader 
        title={strings.client.manualClockIn.screenTitle} 
        onBack={() => navigation.goBack()} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Select Contractor */}
          {isFetchingContractors ? (
            <View style={[styles.input, { justifyContent: 'center' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <DropdownField
              label={strings.client.manualClockIn.selectContractor}
              placeholder={strings.client.manualClockIn.selectContractor}
              data={contractorOptions}
              value={selectedContractor}
              onChange={setSelectedContractor}
              wrapperStyle={{ marginTop: 0 }}
            />
          )}

          {/* Clock-in Time */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <AppText style={[styles.label, { marginBottom: 0 }]}>{strings.client.manualClockIn.clockInTime}</AppText>
            {job?.startDate && (
              <AppText style={{ fontSize: 12, color: colors.gray }}>
                Job Start: {getLocalDateTime(job.startDate).time}
              </AppText>
            )}
          </View>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setIsTimePickerOpen(true)}
            activeOpacity={0.7}
          >
            <AppText style={[styles.inputText, !clockInTime && { color: '#ABB5C5' }]}>
              {clockInTime || strings.client.manualClockIn.enterTime}
            </AppText>
            <Image 
              source={require('@assets/images/common/calander.png')} 
              style={styles.calendarIcon} 
            />
          </TouchableOpacity>

          <DatePicker
            modal
            open={isTimePickerOpen}
            date={selectedTimeDate}
            minimumDate={jobStartDate}
            mode="time"
            onConfirm={(date) => {
              setIsTimePickerOpen(false);
              setSelectedTimeDate(date);
              setClockInTime(formatTime(date));
            }}
            onCancel={() => {
              setIsTimePickerOpen(false);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

       {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => navigation.goBack()}
          >
            <AppText style={styles.cancelBtnText}>{strings.common.cancel}</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.confirmBtn, (isLoading || !selectedContractor || !clockInTime) && { opacity: 0.5 }]} 
            onPress={handleConfirm}
            disabled={isLoading || !selectedContractor || !clockInTime}
          >
            <AppText style={styles.confirmBtnText}>{strings.client.manualClockIn.confirm}</AppText>
          </TouchableOpacity>
        </View>
    </View>
  );
};

export default ManualClockInScreen;
