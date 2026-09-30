import React, { useRef, useState, useEffect } from 'react';
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
const CONTAINER_WIDTH = width - horizontalScale(40);

interface SegmentedControlProps {
  options: string[];
  onSelect: (value: string) => void;
  initialOption?: string;
  containerStyle?: ViewStyle;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  onSelect,
  initialOption,
  containerStyle,
}) => {
  const [active, setActive] = useState(initialOption || options[0]);
  const translateX = useRef(new Animated.Value(options.indexOf(active))).current;
  const segmentWidth = CONTAINER_WIDTH / options.length;

  useEffect(() => {
    const index = options.indexOf(active);
    Animated.spring(translateX, {
      toValue: index * segmentWidth,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [active]);

  const handlePress = (option: string) => {
    setActive(option);
    onSelect(option);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.slider,
            {
              width: segmentWidth,
              transform: [{ translateX }],
            },
          ]}
        />
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.button}
            activeOpacity={1}
            onPress={() => handlePress(option)}
          >
            <AppText
              style={[
                styles.text,
                active === option && styles.activeText,
              ]}
            >
              {option}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: verticalScale(16),
  },
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: horizontalScale(30),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    width: CONTAINER_WIDTH,
    height: verticalScale(48),
    position: 'relative',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary || '#1B00A6',
    borderRadius: horizontalScale(25),
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  activeText: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
  },
});

export default SegmentedControl;
