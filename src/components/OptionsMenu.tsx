import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface MenuAction {
    id: string;
    title: string;
    isDestructive?: boolean;
}

interface OptionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onAction: (id: string) => void;
    actions: MenuAction[];
    title?: string;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
    visible,
    onClose,
    onAction,
    actions,
    title,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.menuContainer}>
                            {title && <AppText style={styles.menuTitle}>{title}</AppText>}
                            
                            {actions.map((action, index) => (
                                <View key={action.id}>
                                    <TouchableOpacity
                                        style={styles.actionItem}
                                        onPress={() => {
                                            onAction(action.id);
                                            onClose();
                                        }}
                                    >
                                        <AppText style={[
                                            styles.actionText,
                                            action.isDestructive && styles.destructiveText
                                        ]}>
                                            {action.title}
                                        </AppText>
                                    </TouchableOpacity>
                                    {index < actions.length - 1 && <View style={styles.separator} />}
                                </View>
                            ))}
                            
                            <View style={styles.cancelSeparator} />
                            <TouchableOpacity style={styles.cancelItem} onPress={onClose}>
                                <AppText style={styles.cancelText}>Cancel</AppText>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
        paddingBottom: verticalScale(30),
        paddingHorizontal: horizontalScale(15),
    },
    menuContainer: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(14),
        overflow: 'hidden',
    },
    menuTitle: {
        fontSize: fontSize(13),
        fontFamily: fonts.medium,
        color: '#8E8E93',
        textAlign: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 0.5,
        borderBottomColor: '#C6C6C8',
    },
    actionItem: {
        height: verticalScale(56),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    actionText: {
        fontSize: fontSize(18),
        fontFamily: fonts.regular,
        color: '#007AFF', // iOS blue
    },
    destructiveText: {
        color: colors.red || '#FF3B30',
    },
    separator: {
        height: 0.5,
        backgroundColor: '#C6C6C8',
        width: '100%',
    },
    cancelSeparator: {
        height: verticalScale(8),
        backgroundColor: 'transparent',
    },
    cancelItem: {
        height: verticalScale(56),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(14),
    },
    cancelText: {
        fontSize: fontSize(18),
        fontFamily: fonts.semiBold,
        color: '#007AFF',
    },
});

export default OptionsMenu;
