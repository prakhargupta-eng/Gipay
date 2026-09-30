import React from 'react';
import { View, Image, StatusBar } from 'react-native';
import styles from './style';

const SplashScreen = () => {
  const splashImage = require('@assets/images/app/splash.png');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Image source={splashImage} style={styles.logo} />
    </View>
  );
};

export default SplashScreen;
