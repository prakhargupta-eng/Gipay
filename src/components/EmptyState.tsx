import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import AppText from '@components/AppText';

interface EmptyStateProps {
  imageSource?: ImageSourcePropType;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ imageSource, title, description }) => {
  return (
    <View style={styles.container}>
      {imageSource && (
        <Image source={imageSource} style={styles.image} />
      )}
      <AppText style={styles.title}>{title}</AppText>
      {description && <AppText style={styles.description}>{description}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(30),
    marginVertical: verticalScale(10),
  },
  image: {
    width: horizontalScale(220),
    height: horizontalScale(220),
    resizeMode: 'contain',
    marginBottom: verticalScale(24),
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize(20),
    color: '#111111',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSize(15),
    color: '#666666',
    textAlign: 'center',
    lineHeight: verticalScale(24),
  },
});

export default EmptyState;
