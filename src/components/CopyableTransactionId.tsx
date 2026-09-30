import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ViewStyle, TextStyle, AppState } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Toast } from '@utils/ToastManager';
import AppText from './AppText';
import { horizontalScale } from '@styles/mixins';
import colors from '@styles/colors';
import strings from '@constants/strings';

interface CopyableTransactionIdProps {
    transactionId: string;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const CopyableTransactionId: React.FC<CopyableTransactionIdProps> = ({ 
    transactionId, 
    style, 
    textStyle,
    numberOfLines = 1,
    ellipsizeMode = 'middle'
}) => {
    const copyTimeRef = React.useRef<number>(0);

    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active' && copyTimeRef.current > 0) {
                const now = Date.now();
                if (now - copyTimeRef.current > 60000) {
                    try {
                        const currentClipboard = await Clipboard.getString();
                        if (currentClipboard === transactionId) {
                            Clipboard.setString('');
                        }
                    } catch (error) {}
                    copyTimeRef.current = 0; // Reset
                }
            }
        });
        return () => subscription.remove();
    }, [transactionId]);

    const handleCopy = () => {
        if (transactionId) {
            Clipboard.setString(transactionId);
            copyTimeRef.current = Date.now();
            Toast.show({
                type: 'success',
                text2: strings.common.copiedToClipboard,
            });
            
            // Auto-clear clipboard after 60 seconds if app stays in foreground
            setTimeout(async () => {
                try {
                    const currentClipboard = await Clipboard.getString();
                    if (currentClipboard === transactionId) {
                        Clipboard.setString('');
                        copyTimeRef.current = 0;
                    }
                } catch {
                  
                }
            }, 60000);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <AppText 
                style={[styles.text, textStyle]} 
                numberOfLines={numberOfLines} 
                ellipsizeMode={ellipsizeMode}
            >
                {transactionId}
            </AppText>
            <TouchableOpacity onPress={handleCopy} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.iconContainer}>
                <Image 
                    source={require('@assets/images/common/copy.png')} 
                    style={styles.icon} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    text: {
        flexShrink: 1,
        alignSelf: 'center',
    },
    iconContainer: {
        marginLeft: horizontalScale(2),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    icon: {
        width: horizontalScale(16),
        height: horizontalScale(16),
        resizeMode: 'contain',
        tintColor: colors.primary, 
    }
});

export default CopyableTransactionId;
