import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import Fonts from '@assets/Fonts';
import Colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface QuickActionButtonProps {
  label: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.iconCircle}>
        <Image
          source={icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <AppText style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: horizontalScale(64),
    height: horizontalScale(64),
    borderRadius: horizontalScale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: horizontalScale(50),
    height: horizontalScale(50),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: Fonts.medium,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: fontSize(20),

  },
});

export default QuickActionButton;
