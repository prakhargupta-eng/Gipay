import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import strings from '@constants/strings';
import styles from './styles';
import colors from '@styles/colors';
import AppText from '@components/AppText';

const { width } = Dimensions.get('window');

const IntroScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const slides = [
    {
      ...strings.intro.slides[0],
      image: require('@assets/images/intro/intro1.png'),
      buttonText: strings.intro.getStarted,
    },
    {
      ...strings.intro.slides[1],
      image: require('@assets/images/intro/intro2.png'),
      buttonText: strings.intro.next,
    },
    {
      ...strings.intro.slides[2],
      image: require('@assets/images/intro/intro3.png'),
      buttonText: strings.intro.next,
    },
  ];

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* 🔥 BACKGROUND IMAGES */}
      <View style={StyleSheet.absoluteFill}>
        {slides.map((item, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1.1, 1, 1.1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.Image
              key={index}
              source={item.image}
              resizeMode="cover"
              style={{
                position: 'absolute',
                width: width,
                height: '100%',
                opacity,
                transform: [{ scale }],
              }}
            />
          );
        })}
      </View>

      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        {/* 🔥 SKIP BUTTON */}
        <TouchableOpacity style={styles.skipContainer} onPress={onFinish}>
          <View style={styles.skipButton}>
            <AppText style={styles.skipText}>{strings.intro.skip}</AppText>
          </View>
        </TouchableOpacity>

      {/* 🔥 SCROLL CONTENT */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveIndex(index);
            },
          }
        )}
      >
        {slides.map((item, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [40, 0, 40],
          });

          return (
            <View key={index} style={styles.slide}>

              <View style={styles.contentContainer}>
                {/* PAGINATION */}
                <View style={styles.paginationContainer}>
                  {slides.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            dotIndex === activeIndex
                              ? colors.introDotActive
                              : colors.introDotInactive,
                          width: dotIndex === activeIndex ? 20 : 8,
                        },
                      ]}
                    />
                  ))}
                </View>

                {/* TEXT */}
                <Animated.View
                  style={{
                    opacity,
                    transform: [{ translateY }],
                  }}
                >
                  <AppText style={styles.title}>{item.title}</AppText>
                  <AppText style={styles.description}>
                    {item.description}
                  </AppText>
                </Animated.View>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

   

      {/* 🔥 FOOTER BUTTON */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 10, 30) }]}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <AppText style={styles.buttonText}>
            {slides[activeIndex].buttonText}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </View>
  );
};

export default IntroScreen;