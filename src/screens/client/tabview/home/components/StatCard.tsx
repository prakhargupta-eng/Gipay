import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import Fonts from '@assets/Fonts';
import Colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

interface StatCardProps {
  count: number;
  label: string;
  labelColor: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  count,
  label,
  labelColor,
  icon,
  onPress,
}) => {
  // Derive a light background color from the label color for the icon wrapper
  const iconBgColor = `${labelColor}15`; // 15 is hex for ~8% opacity

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrapper]}>
          <Image source={icon} style={styles.iconImage} />
        </View>
        <View style={styles.textContainer}>
          <AppText style={styles.count}>{count}</AppText>
          <AppText numberOfLines={1} adjustsFontSizeToFit style={[styles.label, { color: labelColor }]}>{label}</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    marginHorizontal: horizontalScale(6),
    borderWidth: 1,
    borderColor: Colors.statBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  iconImage: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  count: {
    fontSize: fontSize(22),
    fontFamily: Fonts.bold,
    color: Colors.black,
    lineHeight: fontSize(26),
  },
  label: {
    fontSize: fontSize(13),
    fontFamily: Fonts.medium,
    marginTop: verticalScale(1),
  },
});

export default StatCard;
