import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import fonts from '@assets/Fonts';
import colors from '@styles/colors';
import LinearGradient from './LinearGradient';
import { verticalScale, fontSize } from '@styles/mixins';
import AppText from '@components/AppText';

const LoginButton = (props: {
  text: string;
  onPress: () => void;
  loading?: boolean
  disabled?: boolean
}) => {
  const { text,
    onPress,
    loading,
    disabled } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={[disabled ? colors.gray : colors.primary, disabled ? colors.gray : colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <AppText style={styles.buttonText}>{text}</AppText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: verticalScale(55),
    borderRadius: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(18),
    fontWeight: 'bold',
    fontFamily: fonts.semiBold,
  },
});
export default LoginButton;
