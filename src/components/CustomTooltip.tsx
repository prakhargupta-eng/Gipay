import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import AppText from '@components/AppText';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import Fonts from '@assets/Fonts';

interface CustomTooltipProps {
  visible: boolean;
  text: string;
  onClose: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ visible, text, onClose, containerStyle }) => {
  if (!visible) return null;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onClose} style={[styles.tooltipContainer, containerStyle]}>
      <View style={styles.tooltipArrow} />
      <AppText style={styles.tooltipText}>{text}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    width: horizontalScale(250),
    backgroundColor: '#333333',
    borderRadius: horizontalScale(8),
    padding: horizontalScale(12),
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: fontSize(11),
    fontFamily: Fonts.regular,
    lineHeight: verticalScale(16),
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: horizontalScale(10), // align with the info button roughly
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333333',
  }
});

export default CustomTooltip;
