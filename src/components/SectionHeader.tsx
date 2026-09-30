import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Fonts from '@assets/Fonts';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  containerStyle?: any;
  disabled?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
  containerStyle,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText style={styles.title}>{title}</AppText>
      {actionText && (
        <TouchableOpacity 
          onPress={onActionPress} 
          activeOpacity={0.6}
          disabled={disabled}
          style={disabled && { opacity: 0.5 }}
        >
          <AppText style={styles.actionText}>{actionText}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  actionText: {
    fontSize: fontSize(14),
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
});

export default SectionHeader;
