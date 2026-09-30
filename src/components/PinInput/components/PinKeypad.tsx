import React from 'react';
import {
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '@styles/colors';
import AppText from '@components/AppText';
import styles from '../styles';

interface PinKeypadProps {
  digits: string[];
  pinLength: number;
  disabled?: boolean;
  loading?: boolean;
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  onClearAll: () => void;
  keypadContainerStyle?: StyleProp<ViewStyle>;
  keyButtonStyle?: StyleProp<ViewStyle>;
  keyTextStyle?: StyleProp<TextStyle>;
}

const PinKeypad: React.FC<PinKeypadProps> = ({
  digits,
  pinLength,
  disabled = false,
  loading = false,
  onDigitPress,
  onDeletePress,
  onClearAll,
  keypadContainerStyle,
  keyButtonStyle,
  keyTextStyle,
}) => {
  const row1 = digits.slice(0, 3);
  const row2 = digits.slice(3, 6);
  const row3 = digits.slice(6, 9);
  const lastDigit = digits[9];

  const isInteractionDisabled = disabled || loading;
  const isDeleteDisabled = isInteractionDisabled || pinLength === 0;

  return (
    <View style={[styles.keypadContainer, keypadContainerStyle]}>
      {/* Rows 1 to 3 */}
      {[row1, row2, row3].map((row, rIndex) => (
        <View key={`row-${rIndex}`} style={styles.keypadRow}>
          {row.map((digit) => (
            <Pressable
              key={`digit-${digit}`}
              style={({ pressed }) => [
                styles.keyButton,
                pressed && styles.keyPressed,
                isInteractionDisabled && styles.keyDisabled,
                keyButtonStyle,
              ]}
              onPress={() => onDigitPress(digit)}
              disabled={isInteractionDisabled}
            >
              <AppText style={[styles.keyText, keyTextStyle]}>{digit}</AppText>
            </Pressable>
          ))}
        </View>
      ))}

      {/* Row 4: Empty / Spacer, 10th Digit, Delete Button */}
      <View style={styles.keypadRow}>
        {/* Left Blank Spacer to keep symmetric 3-column layout */}
        <View style={styles.emptyKey} />

        {/* 10th Digit */}
        <Pressable
          style={({ pressed }) => [
            styles.keyButton,
            pressed && styles.keyPressed,
            isInteractionDisabled && styles.keyDisabled,
            keyButtonStyle,
          ]}
          onPress={() => onDigitPress(lastDigit)}
          disabled={isInteractionDisabled}
        >
          <AppText style={[styles.keyText, keyTextStyle]}>{lastDigit}</AppText>
        </Pressable>

        {/* Delete / Backspace Button */}
        <Pressable
          style={({ pressed }) => [
            styles.keyButton,
            pressed && styles.keyPressed,
            isDeleteDisabled && styles.keyDisabled,
            keyButtonStyle,
          ]}
          onPress={onDeletePress}
          onLongPress={onClearAll}
          delayLongPress={500}
          disabled={isDeleteDisabled}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {/* Backspace tag */}
            <Path
              d="M21 5H8.5L2 12l6.5 7H21a2 2 0 002-2V7a2 2 0 00-2-2z"
              stroke={pinLength > 0 && !isInteractionDisabled ? colors.primary : colors.gray}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* X cross */}
            <Path
              d="M16 10l-4 4M12 10l4 4"
              stroke={pinLength > 0 && !isInteractionDisabled ? colors.primary : colors.gray}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(PinKeypad);
