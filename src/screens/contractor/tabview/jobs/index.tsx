import React, { useState } from 'react';
import { View, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import styles from './styles';
import colors from '@styles/colors';
import TopHeader from '@components/TopHeader';
import ToggleSwitch from '@components/ToggleSwitch';
import FilterModal from '@components/FilterModal';
import RaiseDisputeModal from '@screens/client/tabview/jobs/common/RaiseDispute/RaiseDisputeModal';
import RateClientModal from './components/RateClientModal';
import ActiveJobsList from './active/ActiveJobsList';
import UpcomingJobsList from './upcoming/UpcomingJobsList';
import CompletedJobsList from './completed/CompletedJobsList';
import { useUserStore } from '@store/useUserStore';
import { devDebugger } from '@utils/devDebugger';
import { isSameDay } from '@utils/dateUtils';

const MainJobsScreen = () => {
  const { jobsActiveSegment, setJobsActiveSegment } = useUserStore();
  const [renderedTab, setRenderedTab] = useState<'Active' | 'Upcoming' | 'Completed'>(jobsActiveSegment as any);
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set([jobsActiveSegment]));
  const [searchQuery, setSearchQuery] = useState('');
  const [isDisputeVisible, setIsDisputeVisible] = useState(false);
  const [disputeJob, setDisputeJob] = useState<any>(null);
  const [isRateVisible, setIsRateVisible] = useState(false);
  const [rateJob, setRateJob] = useState<any>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [isInitialEmpty, setIsInitialEmpty] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [ratedJobIds, setRatedJobIds] = useState<string[]>([]);
  const [disputedJobIds, setDisputedJobIds] = useState<string[]>([]);

  const handleDispute = (job: any) => {
    setDisputeJob(job);
    setIsDisputeVisible(true);
  };

  const handleRateClient = (job: any) => {
    setRateJob(job);
    setIsRateVisible(true);
  };

  React.useEffect(() => {
    setMountedTabs(prev => new Set(prev).add(jobsActiveSegment));
    const timer = setTimeout(() => {
      setRenderedTab(jobsActiveSegment as any);
    }, 50); // small debounce for smooth UI transition
    return () => clearTimeout(timer);
  }, [jobsActiveSegment]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <TopHeader
        title="Jobs"
        hideBackButton={true}
      />

      {/* Tabs */}
      <View style={{ marginHorizontal: 20, marginTop: 20 }}>
        <ToggleSwitch
          options={['Active', 'Upcoming', 'Completed']}
          initialOption={jobsActiveSegment}
          onSelect={(val) => {
            setJobsActiveSegment(val as any);
            setSearchQuery('');
            setFilterStartDate(null);
            setFilterEndDate(null);
            setIsInitialEmpty(false); // Reset while loading new tab
          }}
          containerStyle={{ marginVertical: 0, marginBottom: 20 }}
          wrapperStyle={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderWidth: 1,
            height: 40,
            borderRadius: 24,
          }}
          sliderStyle={{
            backgroundColor: colors.primary,
            height: 40,
            borderRadius: 24,
          }}
          textStyle={{
            color: colors.primary,
            fontSize: 14,
          }}
          activeTextStyle={{
            color: colors.white,
            fontSize: 14,
          }}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={require('@assets/images/common/searchIcon.png')} style={styles.searchIcon} />
        <TextInput allowFontScaling={false} style={[styles.searchInput, (isInitialEmpty || isFetching) && { opacity: 0.5 }]}
          returnKeyType="done"
          placeholder="Search Jobs by Job Title"
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!isInitialEmpty && !isFetching}
        />
        <TouchableOpacity
          onPress={() => setIsFilterVisible(true)}
          disabled={isInitialEmpty || isFetching}
          style={(isInitialEmpty || isFetching) ? { opacity: 0.5 } : {}}
        >
          <Image source={require('@assets/images/common/settingIcon.png')} style={[styles.filterIcon, { tintColor: (filterStartDate || filterEndDate) ? colors.primary : colors.gray }]} />
        </TouchableOpacity>
      </View>

      {/* Lists */}
      {renderedTab === 'Active' && <ActiveJobsList searchQuery={searchQuery} startDate={filterStartDate} endDate={filterEndDate} onDispute={handleDispute} onInitialEmpty={setIsInitialEmpty} onLoadingChange={setIsFetching} ratedJobIds={ratedJobIds} disputedJobIds={disputedJobIds} />}
      {renderedTab === 'Upcoming' && <UpcomingJobsList searchQuery={searchQuery} startDate={filterStartDate} endDate={filterEndDate} onInitialEmpty={setIsInitialEmpty} onLoadingChange={setIsFetching} ratedJobIds={ratedJobIds} disputedJobIds={disputedJobIds} />}
      {renderedTab === 'Completed' && <CompletedJobsList searchQuery={searchQuery} startDate={filterStartDate} endDate={filterEndDate} onDispute={handleDispute} onRateClient={handleRateClient} onInitialEmpty={setIsInitialEmpty} onLoadingChange={setIsFetching} ratedJobIds={ratedJobIds} disputedJobIds={disputedJobIds} />}
      <RaiseDisputeModal
        visible={isDisputeVisible}
        onClose={() => setIsDisputeVisible(false)}
        onSubmit={(data) => {
          if (disputeJob) {
            setDisputedJobIds(prev => [...prev, disputeJob.id || disputeJob._id]);
          }
          devDebugger.log('Dispute Submitted:', data);
          setIsDisputeVisible(false);
        }}
        jobId={disputeJob?.id}
        attendanceId={disputeJob?.attendanceId}
        commingFromContractore={true} 
        hideOption={renderedTab === 'Completed' || isSameDay(disputeJob?.startDate, disputeJob?.endDate)}
      />
      <RateClientModal
        visible={isRateVisible}
        jobId={rateJob?.id || rateJob?._id}
        onClose={() => setIsRateVisible(false)}
        onSubmit={(rating) => {
          if (rateJob) {
            setRatedJobIds(prev => [...prev, rateJob.id || rateJob._id]);
          }
          devDebugger.log(`Submitted rating ${rating} for job ${rateJob?.id || rateJob?._id}`);
          setIsRateVisible(false);
        }}
      />
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={(start, end) => {
          setFilterStartDate(start);
          setFilterEndDate(end);
          setIsFilterVisible(false);
          devDebugger.log('Applied filter:', start, end);
        }}
        onClear={() => {
          setFilterStartDate(null);
          setFilterEndDate(null);
          setIsFilterVisible(false);
          devDebugger.log('Cleared filter');
        }}
        initialStartDate={filterStartDate}
        initialEndDate={filterEndDate}
      />
    </KeyboardAvoidingView>

  );
};

export default MainJobsScreen;
