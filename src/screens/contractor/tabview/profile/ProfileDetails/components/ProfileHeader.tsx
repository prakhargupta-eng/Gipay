import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import colors from '@styles/colors';
import styles from '../styles';
import AppText from '@components/AppText';

interface ProfileHeaderProps {
    isEditMode: boolean;
    imageLoading: boolean;
    profileImage: any;
    fullName: string;
    profile: any;
    onImagePick: () => void;
    setImageLoading: (loading: boolean) => void;
    s: any;
    transactionFeePercent?: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    isEditMode,
    imageLoading,
    profileImage,
    fullName,
    profile,
    onImagePick,
    setImageLoading,
    s,
    transactionFeePercent,
}) => {
    const getProfileImage = () => {
        if (profileImage?.uri) {
           if (profileImage.uri.startsWith('http')) {
               return { 
                   uri: profileImage.uri,
                   priority: FastImage.priority.normal,
                   cache: FastImage.cacheControl.web 
               };
           }
           return { uri: profileImage.uri };
       }
        return require('@assets/images/common/dummyUser.png');
    };

    return (
        <View style={styles.profileHeader}>
            <TouchableOpacity onPress={isEditMode ? onImagePick : undefined} activeOpacity={0.8}>
                <View style={styles.imageWrapper}>
                    {imageLoading && <ActivityIndicator style={styles.loader} color={colors.primary} />}
                    <FastImage
                        source={getProfileImage()}
                        style={styles.profileImage}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                    />
                    {isEditMode && (
                        <View style={styles.cameraIconBadge}>
                            <FastImage source={require('@assets/images/common/camera.png')} style={styles.cameraIcon} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <AppText style={styles.userName} numberOfLines={1}>
                {isEditMode
                    ? `${fullName}`
                    : (profile?.user?.fullName || `${fullName}`)
                }
            </AppText>
            <AppText style={styles.commissionText}>
                {s.commissionFee(transactionFeePercent != null ? `${transactionFeePercent}%` : '7%')}
            </AppText>
        </View>
    );
};

export default ProfileHeader;
