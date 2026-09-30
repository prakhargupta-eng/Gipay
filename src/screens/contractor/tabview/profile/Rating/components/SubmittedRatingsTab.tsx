import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import styles from '../styles';
import RatingCard from './RatingCard';
import RatingSkeleton from './RatingSkeleton';
import colors from '@styles/colors';
import { RatingData } from '../types';
import EmptyState from '@components/EmptyState';
import strings from '@constants/strings';

interface SubmittedRatingsTabProps {
    data: RatingData[];
    isLoading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onLoadMore: () => void;
    isFetchingMore: boolean;
}

const SubmittedRatingsTab: React.FC<SubmittedRatingsTabProps> = ({
    data,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingMore
}) => {
    if (isLoading) {
        return (
            <View style={styles.listContent}>
                {[1, 2, 3, 4].map((i) => (
                    <RatingSkeleton key={i} />
                ))}
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <RatingCard item={item} isReceived={false} />
            )}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingMore ? (
                    <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : null
            }
            ListEmptyComponent={
                <EmptyState 
                    imageSource={require('@assets/images/common/noData.png')}
                    title={strings.auth.contractor.profile.ratingsData.noSubmittedRatingsTitle}
                    description={strings.auth.contractor.profile.ratingsData.noSubmittedRatingsDesc}
                />
            }
        />
    );
};

export default SubmittedRatingsTab;
