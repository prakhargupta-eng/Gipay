import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import AppText from '@components/AppText';
import CityItem from '@components/CityItem'; // Reusing CityItem for consistency
import InputField from '@components/InputField';
import styles from './styles';
import colors from '@styles/colors';
import AuthService from '@config/authService';
import { debounce } from '@utils/debounce';
import { devDebugger } from '@utils/devDebugger';

interface CountrySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: { label: string; value: string }) => void;
    selectedCountryId?: string;
    title?: string;
}

const CountrySelectionModal: React.FC<CountrySelectionModalProps> = ({
    visible,
    onClose,
    onSelect,
    selectedCountryId,
    title = 'Select Country'
}) => {
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchCountries = useCallback(async (pageNum: number, query: string, append: boolean = false) => {
        if (!append) setIsLoading(true);
        else setIsFetchingMore(true);

        try {
            const response = await AuthService.getCountries(pageNum, 25, query);
            if (response.success && response.data) {
                const items = Array.isArray(response.data) ? response.data : (response.data as any).countries || [];
                const mappedCountries = items.map((item: any) => ({
                    label: item.name || item.label,
                    value: item.id || item.value
                }));

                if (append) {
                    setCountries(prev => [...prev, ...mappedCountries]);
                } else {
                    setCountries(mappedCountries);
                }

                setHasMore(items.length === 25);
            } else {
                if (!append) setCountries([]);
                setHasMore(false);
            }
        } catch (error) {
            devDebugger.error('[CountrySelectionModal] Fetch Error:', error);
            if (!append) setCountries([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce((text: string) => {
                setPage(1);
                fetchCountries(1, text, false);
            }, 500),
        [fetchCountries]
    );

    useEffect(() => {
        if (visible) {
            setSearchQuery('');
            setPage(1);
            fetchCountries(1, '', false);
        }
    }, [visible]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };

    const handleLoadMore = () => {
        if (!isLoading && !isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCountries(nextPage, searchQuery, true);
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
                        <AppText style={styles.title}>{title}</AppText>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <AppText style={styles.closeText}>Close</AppText>
                        </TouchableOpacity>
                    </View>

                    <InputField
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        wrapperStyle={{ flex: 0, marginBottom: 15 }}
                    />

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : (
                        <FlatList
                            style={{ flex: 1 }}
                            data={countries}
                            keyExtractor={(item) => item.value}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            ListFooterComponent={() => 
                                isFetchingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} /> : null
                            }
                            renderItem={({ item }) => (
                                <CityItem
                                    label={item.label}
                                    onSelect={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    isSelected={selectedCountryId === item.value}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CountrySelectionModal;
