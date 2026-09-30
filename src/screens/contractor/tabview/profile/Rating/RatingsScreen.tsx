import React, { useState, useEffect, useRef } from 'react';
import {  StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import { ClientAppStackParamList } from '@navigation/client/ClientAppStack';
import strings from '@constants/strings';
import ToggleSwitch from '@components/ToggleSwitch';
import TopHeader from '@components/TopHeader';
import AuthService from '@config/authService';
import { formatDate, getLocalDateTime } from '@utils/dateUtils';
import styles from './styles';
import { RatingData } from './types';
import ReceivedRatingsTab from './components/ReceivedRatingsTab';
import SubmittedRatingsTab from './components/SubmittedRatingsTab';
import { devDebugger } from '@utils/devDebugger';

type NavigationProp = NativeStackNavigationProp<ContractorAppStackParamList & ClientAppStackParamList, 'Ratings'>;

const RatingsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState(strings.auth.contractor.profile.ratingsData.receivedRating);

    const [receivedData, setReceivedData] = useState<RatingData[]>([]);
    const [submittedData, setSubmittedData] = useState<RatingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [receivedPage, setReceivedPage] = useState(1);
    const [submittedPage, setSubmittedPage] = useState(1);
    const [hasMoreReceived, setHasMoreReceived] = useState(true);
    const [hasMoreSubmitted, setHasMoreSubmitted] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchReceivedRatings = async (page: number, isMore = false) => {
        try {
            const response = await AuthService.getReceivedRatings(page, 10);
            if (response.success && response.data) {
                const resultsArray = response.data?.results?.data || response.data?.data || [];
                const mappedData = resultsArray.map((item: any) => ({
                    id: item.id || item._id,
                    company: item.raterName || item.ratedName || 'N/A',
                    jobTitle: item.jobTitle || 'N/A',
                    date: item.jobStartDate ? getLocalDateTime(item.jobStartDate).date : (item.createdAt ? getLocalDateTime(item.createdAt).date : 'N/A'),
                    time: (item.jobStartDate && item.jobEndDate)
                        ? `${getLocalDateTime(item.jobStartDate).time} - ${getLocalDateTime(item.jobEndDate).time}`
                        : ((item.jobStartTime && item.jobEndTime) ? `${item.jobStartTime} - ${item.jobEndTime}` : 'N/A'),
                    rating: item.stars ? Number(item.stars).toFixed(1) : '0.0',
                    tags: item.categories || []
                }));

                if (isMore) {
                    setReceivedData(prev => [...prev, ...mappedData]);
                } else {
                    setReceivedData(mappedData);
                }

                if (mappedData.length < 10) setHasMoreReceived(false);
                else setHasMoreReceived(true);
            } else {
                if (!isMore) setReceivedData([]);
                setHasMoreReceived(false);
            }
        } catch (error) {
            devDebugger.error('Error fetching received ratings:', error);
            setHasMoreReceived(false);
        }
    };

    const fetchSubmittedRatings = async (page: number, isMore = false) => {
        try {
            const response = await AuthService.getSubmittedRatings(page, 10);
            if (response.success && response.data) {
                const resultsArray = response.data?.results?.data || response.data?.data || [];
                const mappedData = resultsArray.map((item: any) => ({
                    id: item.id || item._id,
                    company: item.ratedName ,
                    jobTitle: item.jobTitle || 'N/A',
                    date: item.jobStartDate ? `${getLocalDateTime(item.jobStartDate).date} - ${getLocalDateTime(item.jobEndDate).date}` : (item.createdAt ? getLocalDateTime(item.createdAt).date : 'N/A'),
                    time: (item.jobStartDate && item.jobEndDate)
                        ? `${getLocalDateTime(item.jobStartDate).time} - ${getLocalDateTime(item.jobEndDate).time}`
                        : ((item.jobStartTime && item.jobEndTime) ? `${item.jobStartTime} - ${item.jobEndTime}` : 'N/A'),
                    rating: item.stars ? Number(item.stars).toFixed(1) : '0.0',
                    tags: item.categories || []
                }));

                if (isMore) {
                    setSubmittedData(prev => [...prev, ...mappedData]);
                } else {
                    setSubmittedData(mappedData);
                }

                if (mappedData.length < 10) setHasMoreSubmitted(false);
                else setHasMoreSubmitted(true);
            } else {
                if (!isMore) setSubmittedData([]);
                setHasMoreSubmitted(false);
            }
        } catch (error) {
            devDebugger.error('Error fetching submitted ratings:', error);
            setHasMoreSubmitted(false);
        }
    };

    const loadData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
            if (activeTab === strings.auth.contractor.profile.ratingsData.receivedRating) {
                setReceivedPage(1);
                setHasMoreReceived(true);
                await fetchReceivedRatings(1);
            } else {
                setSubmittedPage(1);
                setHasMoreSubmitted(true);
                await fetchSubmittedRatings(1);
            }
            setRefreshing(false);
        }
    };

    const handleLoadMore = async () => {
        if (isFetchingMore) return;

        if (activeTab === strings.auth.contractor.profile.ratingsData.receivedRating) {
            if (!hasMoreReceived) return;
            setIsFetchingMore(true);
            const nextPage = receivedPage + 1;
            await fetchReceivedRatings(nextPage, true);
            setReceivedPage(nextPage);
        } else {
            if (!hasMoreSubmitted) return;
            setIsFetchingMore(true);
            const nextPage = submittedPage + 1;
            await fetchSubmittedRatings(nextPage, true);
            setSubmittedPage(nextPage);
        }

        setIsFetchingMore(false);
    };

    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            setIsLoading(true);
            if (activeTab === strings.auth.contractor.profile.ratingsData.receivedRating) {
                fetchReceivedRatings(1).finally(() => setIsLoading(false));
            } else {
                fetchSubmittedRatings(1).finally(() => setIsLoading(false));
            }
            return;
        }

        const timer = setTimeout(() => {
            setIsLoading(true);
            if (activeTab === strings.auth.contractor.profile.ratingsData.receivedRating) {
                fetchReceivedRatings(1).finally(() => setIsLoading(false));
            } else {
                fetchSubmittedRatings(1).finally(() => setIsLoading(false));
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [activeTab]);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            <TopHeader
                title={strings.auth.contractor.profile.ratingsData.screenTitle}
                onBack={() => navigation.goBack()}
            />

            <View style={styles.switchContainer}>
                <ToggleSwitch
                    options={[
                        strings.auth.contractor.profile.ratingsData.receivedRating,
                        strings.auth.contractor.profile.ratingsData.submittedRating
                    ]}
                    onSelect={(val) => setActiveTab(val)}
                    wrapperStyle={styles.toggleWrapper}
                    sliderStyle={styles.toggleSlider}
                    textStyle={styles.toggleText}
                    activeTextStyle={styles.toggleActiveText}
                    containerStyle={styles.toggleContainer}
                />
            </View>

            {activeTab === strings.auth.contractor.profile.ratingsData.receivedRating ? (
                <ReceivedRatingsTab
                    data={receivedData}
                    isLoading={isLoading}
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                    onLoadMore={handleLoadMore}
                    isFetchingMore={isFetchingMore}
                />
            ) : (
                <SubmittedRatingsTab
                    data={submittedData}
                    isLoading={isLoading}
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                    onLoadMore={handleLoadMore}
                    isFetchingMore={isFetchingMore}
                />
            )}
        </View>
    );
};

export default RatingsScreen;
