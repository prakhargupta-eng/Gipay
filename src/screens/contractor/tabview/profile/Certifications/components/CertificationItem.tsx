import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { itemStyles as styles } from '../styles';
import { getFileIcon } from '@utils/fileUtils';
import AppText from '@components/AppText';

interface CertificationItemProps {
    name: string;
    url?: string;
    onPress: () => void;
    onDelete: () => void;
    isLoading?: boolean;
}

const CertificationItem: React.FC<CertificationItemProps> = ({
    name,
    url,
    onPress,
    onDelete,
    isLoading = false
}) => {
    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={onPress} 
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Image
                    source={getFileIcon(url)}
                    style={styles.certIcon}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.detailsContainer}>
                <AppText style={styles.name} numberOfLines={1}>
                    {name}
                </AppText>
            </View>
            <TouchableOpacity 
                onPress={onDelete} 
                style={styles.deleteButton}
                disabled={isLoading}
            >
                {/* {isLoading ? (
                    <ActivityIndicator size="small" color={colors.red} />
                ) : (
                    <Image
                        source={require('@assets/images/common/trashIconBlack.png')}
                        style={styles.deleteIcon}
                        resizeMode="contain"
                    />
                )} */}
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default CertificationItem;
