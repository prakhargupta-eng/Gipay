import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  TextStyle,
  ViewStyle
} from 'react-native';
import fonts from '@assets/Fonts';
import { verticalScale, horizontalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import AppText from '@components/AppText';

const { width } = Dimensions.get('window');
const SWITCH_WIDTH = width * 0.85;

const ToggleSwitch = ({
  options,
  onSelect,
  textStyle,
  sliderStyle,
  activeTextStyle,
  wrapperStyle,
  containerStyle,
  initialOption,
}: {
  options: string[];
  onSelect: (value: string) => void;
  textStyle?: TextStyle;
  sliderStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  wrapperStyle?: ViewStyle;
  initialOption?: string;
}) => {
  const initialIndex = initialOption ? options.indexOf(initialOption) : 0;
  const [active, setActive] = useState(initialOption || options[0]);
  const translateX = useRef(new Animated.Value(initialIndex === -1 ? 0 : initialIndex)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  React.useEffect(() => {
    if (initialOption) {
      const index = options.indexOf(initialOption);
      if (index !== -1) {
        setActive(initialOption);
        translateX.setValue(index);
      }
    }
  }, [initialOption]);

  const toggle = (value: string, index: number) => {
    setActive(value);
    onSelect(value);

    Animated.timing(translateX, {
      toValue: index,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const slideInterpolate = translateX.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => (containerWidth / options.length) * i),
  });

  return (
    <View 
      style={[styles.container, containerStyle]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.wrapper, wrapperStyle, { width: '100%' }]}>
        <Animated.View
          style={[
            styles.slider,
            sliderStyle,
            { 
              width: `${100 / options.length}%`,
              transform: [{ translateX: slideInterpolate }] 
            },
          ]}
        />

        {options.map((item, index) => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            activeOpacity={1}
            onPress={() => toggle(item, index)}
          >
            <AppText
              style={[
                styles.text,
                textStyle,
                active === item && [styles.activeText, activeTextStyle],
              ]}
            >
              {item}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ToggleSwitch;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  wrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: verticalScale(30),
    overflow: 'hidden',
    width: SWITCH_WIDTH,
    height: verticalScale(48),
    backgroundColor: 'transparent',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    width: SWITCH_WIDTH / 2,
    height: verticalScale(48),
    backgroundColor: '#FFFFFF',
    borderRadius: verticalScale(27),
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
  },
  activeText: {
    color: '#000000',
    fontFamily: fonts.regular,
    fontSize: fontSize(18),
  },
});