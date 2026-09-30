import React from 'react';
import {
  View,
  Image,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import colors from '@styles/colors';
import AppText from '@components/AppText';
import styles from '../styles';

const filedDotImg = require('@assets/images/common/filedDot.png');
const emptyDotImg = require('@assets/images/common/emptyDot.png');

interface PinDotsProps {
  length: number;
  pinLength: number;
  hasError: boolean;
  errorMessage?: string;
  shakeAnim: Animated.Value;
  dotsContainerStyle?: StyleProp<ViewStyle>;
  dotStyle?: StyleProp<ImageStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

const PinDots: React.FC<PinDotsProps> = ({
  length = 4,
  pinLength = 0,
  hasError,
  errorMessage,
  shakeAnim,
  dotsContainerStyle,
  dotStyle,
  errorTextStyle,
}) => {
  const safeLength = Math.max(1, Number(length) || 4);
  const safePinLength = Math.max(0, Number(pinLength) || 0);

  return (
    <>
      <Animated.View
        style={[
          styles.dotsWrapper,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <View style={[styles.dotsContainer, dotsContainerStyle]}>
          {Array.from({ length: safeLength }).map((_, index) => {
            const isFilled = index < safePinLength;
            return (
              <Image
                key={`dot-${index}`}
                source={isFilled ? filedDotImg : emptyDotImg}
                style={[
                  styles.dot,
                  { tintColor: hasError ? colors.red : colors.primary },
                  dotStyle,
                ]}
                resizeMode="contain"
              />
            );
          })}
        </View>
      </Animated.View>

      {errorMessage ? (
        <AppText style={[styles.errorText, errorTextStyle]}>
          {errorMessage}
        </AppText>
      ) : null}
    </>
  );
};

export default React.memo(PinDots);
