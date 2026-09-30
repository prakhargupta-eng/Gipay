import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import LinearGradient from './LinearGradient';
import { verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradientColors?: string[];
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  gradientColors,
}) => {
  const isButtonDisabled = disabled || loading;
  const colorsArray = gradientColors || [
    isButtonDisabled ? colors.gray : colors.primary,
    isButtonDisabled ? colors.gray : colors.primary,
  ];

  const flattenedStyle: any = StyleSheet.flatten(style) || {};
  const flattenedTextStyle: any = StyleSheet.flatten(textStyle) || {};

  const {
    margin, marginHorizontal, marginVertical, marginTop, marginBottom, marginLeft, marginRight,
    flex, flexBasis, flexDirection, flexGrow, flexShrink, flexWrap,
    alignSelf,
    position, top, bottom, left, right, zIndex,
    width, height, // Be careful with these
    ...innerStyle
  } = flattenedStyle;

  const containerStyle = {
    margin, marginHorizontal, marginVertical, marginTop, marginBottom, marginLeft, marginRight,
    flex, flexBasis, flexDirection, flexGrow, flexShrink, flexWrap,
    alignSelf,
    position, top, bottom, left, right, zIndex,
    width, height
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.buttonContainer, containerStyle]}
      onPress={() => {
        onPress();
      }}
      disabled={isButtonDisabled}
    >
      <LinearGradient
        colors={colorsArray}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, innerStyle]}
      >
        {loading ? (
          <ActivityIndicator color={flattenedTextStyle.color === colors.primary ? colors.primary : colors.white} />
        ) : (
          <AppText style={[styles.buttonText, textStyle]}>{title}</AppText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
  },
  button: {
    height: verticalScale(55),
    borderRadius: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(18),
    fontFamily: fonts.medium,
  },
});

export default CustomButton;