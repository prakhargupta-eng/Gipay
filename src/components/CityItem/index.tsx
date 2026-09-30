import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import AppText from '@components/AppText';
import styles from './styles';

interface CityItemProps {
    label: string;
    onSelect: () => void;
    isSelected?: boolean;
}

const CityItem: React.FC<CityItemProps> = ({ label, onSelect, isSelected }) => {
    return (
        <TouchableOpacity
            style={styles.cityItemContainer}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            <View style={styles.leftContent}>
                <Image
                    source={require('@assets/images/common/city.png')}
                    style={styles.cityIcon}
                    resizeMode="contain"
                />
                <AppText style={[styles.cityLabel, isSelected && styles.selectedLabel]}>{label}</AppText>
            </View>
            {isSelected && (
                <Image
                    source={require('@assets/images/common/checkPlain.png')}
                    style={styles.checkIcon}
                    resizeMode="contain"
                />
            )}
        </TouchableOpacity>
    );
};

export default CityItem;
