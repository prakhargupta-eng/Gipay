// 

import React, { ReactNode } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface CustomBackgroundProps {
  children?: ReactNode;
}

const CustomBackground = ({ children }: CustomBackgroundProps) => {
  const bgImage = require('@assets/images/app/background.png');
  return (
    <View style={styles.container}>
      <Image source={bgImage} style={styles.background} resizeMode="cover" />
      {children}
    </View>
  );
};

export default CustomBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: width,
    height: '100%',

  },
});