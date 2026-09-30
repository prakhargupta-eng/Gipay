import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Image } from 'react-native';
import AppText from '@components/AppText';
import CityItem from '@components/CityItem';
import styles from './styles';
import colors from '@styles/colors';
import AuthService from '@config/authService';
import strings from '@constants/strings';
import { devDebugger } from '@utils/devDebugger';

interface CitySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    provinceId?: string;
    onSelect: (item: { label: string; value: string }) => void;
    selectedCityId?: string;
}

const CitySelectionModal: React.FC<CitySelectionModalProps> = ({
    visible,
    onClose,
    provinceId,
    onSelect,
    selectedCityId,
}) => {
    const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCities = useCallback(async (pageNum: number, append: boolean = false, query: string = '') => {
        if (!provinceId) return;
        if (!append) setIsLoading(true);
        else setIsFetchingMore(true);

        try {
            const response = await AuthService.getCities(provinceId, pageNum, 25, query);
            if (response.success && response.data) {
                const responseData = response.data as any;
                let citiesData: any[] = [];
                if (Array.isArray(responseData)) {
                    citiesData = responseData;
                } else if (responseData.cities && Array.isArray(responseData.cities)) {
                    citiesData = responseData.cities;
                }

                const mappedCities = citiesData.map((item: any) => ({
                    label: item.name || item.cityName,
                    value: item._id || item.id
                }));

                if (append) {
                    setCities(prev => [...prev, ...mappedCities]);
                } else {
                    setCities(mappedCities);
                }

                setHasMore(citiesData.length === 25);
            } else {
                if (!append) setCities([]);
                setHasMore(false);
            }
        } catch (error) {
            devDebugger.error('[CitySelectionModal] Fetch Error:', error);
            if (!append) setCities([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [provinceId]);

    // Handle visible changes to reset state
    useEffect(() => {
        if (visible) {
            setSearchQuery(''); // Reset search on open
            setPage(1);
        }
    }, [visible]);

    // Handle fetching with debounce
    useEffect(() => {
        if (!visible || !provinceId) return;
        
        const timer = setTimeout(() => {
            setPage(1);
            fetchCities(1, false, searchQuery);
        }, searchQuery ? 500 : 0);
        
        return () => clearTimeout(timer);
    }, [searchQuery, visible, provinceId, fetchCities]);

    const handleLoadMore = () => {
        if (!isLoading && !isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCities(nextPage, true, searchQuery);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <AppText style={styles.title}>{strings.common.citySelection.selectCity}</AppText>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <AppText style={styles.closeText}>{strings.common.citySelection.close}</AppText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Image source={require('@assets/images/common/searchIcon.png')} style={styles.searchIcon} />
                        <TextInput
                            allowFontScaling={false}
                            returnKeyType="done"
                            style={styles.searchInput}
                            placeholder={strings.common.citySelection.searchPlaceholder}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : (
                        <FlatList
                            data={cities}
                            keyExtractor={(item) => item.value}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            ListFooterComponent={() => 
                                isFetchingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} /> : null
                            }
                            ListEmptyComponent={() => (
                                <View style={{ alignItems: 'center', marginTop: 40 }}>
                                    <AppText style={{ color: '#6B7280', fontSize: 16 }}>
                                        {searchQuery ? strings.common.citySelection.noDataForSearch : strings.common.citySelection.noDataAvailable}
                                    </AppText>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <CityItem
                                    label={item.label}
                                    onSelect={() => onSelect(item)}
                                    isSelected={selectedCityId === item.value}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CitySelectionModal;
