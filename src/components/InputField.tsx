import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View
} from 'react-native';
import { fontSize, horizontalScale, verticalScale } from '@styles/mixins';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import AppText from '@components/AppText';

interface InputFieldProps extends TextInputProps {
  label?: string;

  containerStyle?: any;
  inputStyle?: any;
  wrapperStyle?: any;
  errorTextStyle?: any;
  showPasswordEye?: boolean;
  renderEye?: (visible: boolean) => React.ReactNode;
  renderLeftIcon?: () => React.ReactNode;
  renderRightIcon?: () => React.ReactNode;

  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  containerStyle,
  inputStyle,
  wrapperStyle,
  errorTextStyle,
  placeholder,
  keyboardType = 'default',

  showPasswordEye = false,
  renderEye,
  renderLeftIcon,
  renderRightIcon,

  value,
  onChangeText,
  error,
  disabled = false,

  ...rest
}) => {
  const [secure, setSecure] = useState(!!rest.secureTextEntry);

  const eyeIcon = require('@assets/images/common/openEye.png');
  const eyeSlashIcon = require('@assets/images/common/closeEye.png');

  const isSecureField = Boolean(showPasswordEye || rest.secureTextEntry);
  const isReadOnlyDisplay = rest.editable === false && !isSecureField;

  let resolvedNumberOfLines: number | undefined;
  if (rest.numberOfLines !== undefined) {
    resolvedNumberOfLines = rest.numberOfLines;
  } else if (rest.multiline) {
    resolvedNumberOfLines = undefined;
  } else {
    resolvedNumberOfLines = 1;
  }

  return (
    <View style={[styles.wrapper, wrapperStyle, disabled && { opacity: 0.6 }]}>

      {/* Label */}
      {label ? <AppText style={styles.label}>{label}</AppText> : null}

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? colors.red : colors.border },
          containerStyle,
        ]}
      >
        {renderLeftIcon && renderLeftIcon()}
        {isReadOnlyDisplay ? (
          <AppText
            style={[
              styles.input,
              inputStyle,
              { lineHeight: verticalScale(20) },
              !value && { color: rest.placeholderTextColor || '#A0A0A0' },
            ]}
            numberOfLines={resolvedNumberOfLines}
            ellipsizeMode="tail"
          >
            {value || placeholder}
          </AppText>
        ) : (
          <TextInput
            returnKeyType="done"
            {...rest}
            allowFontScaling={false}
            style={[styles.input, inputStyle]}
            value={value}
            onChangeText={(text) => {
              // Remove emojis globally from all input fields
              const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F02B}\u{1F004}\u{1F0CF}\u{1F0D1}]/gu, '');
              if (onChangeText) {
                onChangeText(cleanText);
              }
            }}
            placeholder={placeholder}
            placeholderTextColor={rest.placeholderTextColor || '#A0A0A0'}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            cursorColor={colors.primary} // Android
            selectionColor={colors.gray} // iOS
            editable={!disabled && rest.editable !== false}
          />
        )}

        {showPasswordEye && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            {renderEye ? (
              renderEye(secure)
            ) : (
              <Image
                source={secure ? eyeIcon : eyeSlashIcon}
                style={styles.eye}
              />
            )}
          </TouchableOpacity>
        )}

        {renderRightIcon && !showPasswordEye && renderRightIcon()}
      </View>

      {/* Error */}
      {error ? <AppText style={[styles.errorText, errorTextStyle]}>{error}</AppText> : null}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  label: {
    marginBottom: verticalScale(12),
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginLeft: horizontalScale(5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: colors.white,
    borderRadius: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(52),
  },
  input: {
    flex: 1,
    fontSize: fontSize(16),
    color: colors.black,
    fontFamily: fonts.medium,
    paddingVertical: 0, // Fix for Android cursor height
    textAlignVertical: 'center', // Align text and cursor
    includeFontPadding: false, // Remove extra space that can hide cursor
  },
  eye: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    marginLeft: horizontalScale(8),
  },
  errorText: {
    marginTop: verticalScale(6),
    marginLeft: horizontalScale(4),
    color: colors.red,
    fontSize: fontSize(12),
    fontFamily: fonts.regular,
  },
});