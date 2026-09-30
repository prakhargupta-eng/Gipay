import React from 'react';
import { View, StyleSheet, Modal, Linking } from 'react-native';
import AppText from './AppText';
import CustomButton from './CustomButton';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';

interface LocationPermissionModalProps {
    visible: boolean;
    onClose?: () => void; // Optional if we want to force them to open settings
    onOpenSettings: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ visible, onClose, onOpenSettings }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <AppText style={styles.icon}>📍</AppText>
                    </View>
                    <AppText style={styles.title}>Location Permission</AppText>
                    <AppText style={styles.message}>
                        Location permission is required to continue. Please enable location access from system settings.
                    </AppText>
                    
                    <CustomButton 
                        title="Open Settings" 
                        onPress={onOpenSettings} 
                        style={styles.button}
                    />
                    
                    {onClose && (
                        <CustomButton 
                            title="Cancel" 
                            onPress={onClose} 
                            style={styles.cancelButton}
                            textStyle={styles.cancelText}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(24),
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: horizontalScale(30),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    icon: {
        fontSize: fontSize(30),
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: fontSize(20),
        color: colors.black,
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    message: {
        fontFamily: fonts.regular,
        fontSize: fontSize(14),
        color: colors.gray,
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: fontSize(20),
    },
    button: {
        width: '100%',
        marginBottom: verticalScale(10),
    },
    cancelButton: {
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    cancelText: {
        color: colors.gray,
        fontFamily: fonts.semiBold,
    }
});

export default LocationPermissionModal;
