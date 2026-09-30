import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import AppText from '@components/AppText';

interface TopHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightComponent?: React.ReactNode;
    hideBackButton?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle, onBack, rightComponent, hideBackButton }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[ styles.header,
            {
                paddingTop: insets.top > 0 ? insets.top : verticalScale(20),
                height: verticalScale(56) + (insets.top > 0 ? insets.top : verticalScale(20)),
                marginTop: onBack && !hideBackButton ? verticalScale(10) : 0
            }
        ]}>
            <View style={styles.leftContainer}>
                {onBack && !hideBackButton && (
                    <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                        <Image
                            source={require('@assets/images/common/backIcon.png')}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={[
                styles.titleContainer,
                { top: insets.top > 0 ? insets.top : verticalScale(20) }
            ]}>
                <AppText style={styles.headerTitle} numberOfLines={1}>{title}</AppText>
                {subtitle && <AppText style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</AppText>}
            </View>

            <View style={[styles.rightContainer, rightComponent ? { width: 'auto', minWidth: horizontalScale(80) } : null]}>
                {rightComponent ? rightComponent : <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(20),
        backgroundColor: colors.white,
    },
    leftContainer: {
        width: horizontalScale(80),
        height: '100%',
        justifyContent: 'center',
        zIndex: 10,
    },
    backBtn: {
        width: horizontalScale(40),
        height: verticalScale(40),
        justifyContent: 'center',
    },
    backIcon: {
        width: horizontalScale(30),
        height: horizontalScale(30),
        tintColor: colors.black,
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    headerTitle: {
        fontSize: fontSize(20),
        fontFamily: fonts.semiBold,
        color: colors.black,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: fontSize(12),
        fontFamily: fonts.regular,
        color: colors.gray,
        textAlign: 'center',
        marginTop: verticalScale(2),
    },
    rightContainer: {
        width: horizontalScale(80),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 10,
    },
    placeholder: {
        width: horizontalScale(80),
    }
});

export default TopHeader;