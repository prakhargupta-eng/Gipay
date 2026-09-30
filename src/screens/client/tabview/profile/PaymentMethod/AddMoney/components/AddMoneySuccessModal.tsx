import { formatCurrency } from '@utils/currencyUtils';
import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

interface AddMoneySuccessModalProps {
  visible: boolean;
  amount: string;
  onDone: () => void;
}

const AddMoneySuccessModal = ({ visible, amount, onDone }: AddMoneySuccessModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LottieView
            source={require('@assets/animation/pending.json')}
            autoPlay
            loop={false}
            style={styles.lottieIcon}
          />
          <AppText style={styles.currencyAmount}>{formatCurrency(amount)}</AppText>
          <AppText style={styles.title}>{strings.client.profile.wallet.successTitle}</AppText>
          <AppText style={styles.subtitle}>{strings.client.profile.wallet.successSubtitle}</AppText>

          <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
            <AppText style={styles.doneBtnText}>{strings.client.profile.wallet.doneBtn}</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: colors.white,
    borderRadius: horizontalScale(24),
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  lottieIcon: {
    width: horizontalScale(100),
    height: horizontalScale(100),
  },
  currencyAmount: {
    fontSize: fontSize(38),
    fontFamily: fonts.bold,
    color: colors.black,
    marginTop: verticalScale(0),
    marginBottom: verticalScale(8),
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: verticalScale(32),
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: horizontalScale(56),
    height: verticalScale(48),
    borderRadius: horizontalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
});

export default AddMoneySuccessModal;
