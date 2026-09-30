import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import CustomButton from '@components/CustomButton';
import PinInput from '@components/PinInput';
import styles from './styles';
import AppText from '@components/AppText';
import strings, { CURRENCY } from '@constants/strings';
import PaymentService from '@config/paymentService';
import AuthService from '@config/authService';
import { Toast } from '@utils/ToastManager';
import AddMoneySuccessModal from './components/AddMoneySuccessModal';
import usePopOnBack from '@hooks/usePopOnBack';
import { useUserStore } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import { encryptPin } from '@utils/cryptoUtils';
import { devDebugger } from '@utils/devDebugger';

const AddMoneyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const paymentMethod = route.params?.paymentMethod || {};

  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | undefined>(undefined);
  const t = strings.client.profile.wallet;

  const { settings, fetchSettings } = useSystemStore();

  const minAmount = settings?.addMoneyMin ?? 1;
  const maxAmount = settings?.addMoneyMax ?? 10;
  const numericAmount = Number(amount);
  const isOutOfRange = amount ? (numericAmount < minAmount || numericAmount > maxAmount) : false;

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Intercept back actions (hardware back/swipe back) when success modal is open to pop 2 screens
  usePopOnBack(showSuccess ? 2 : 1);

  const isCard = paymentMethod.cardBrand || paymentMethod.lastFourDigits;
  const methodName = paymentMethod.bankName || paymentMethod.cardBrand || (isCard ? 'Visa' : 'BCA');
  const lastFour = paymentMethod.lastFourDigits || (paymentMethod.accountNumber ? String(paymentMethod.accountNumber).slice(-4) : '8907');
  const methodDetails = `**** **** **${lastFour.slice(0, 2)} ${lastFour.slice(2)}`;

  const iconSource = isCard
    ? require('@assets/images/common/card.png')
    : require('@assets/images/common/bca.png');

  const handleBack = () => navigation.goBack();

  const handleAdd = async () => {
    if (!amount) return;

    if (isOutOfRange) {
      Toast.show({
        type: 'error',
        text2: t.amountRangeError(minAmount, maxAmount, CURRENCY),
        duration: 3000,
      });
      return;
    }

    if (useUserStore.getState().isClientRestricted()) {
      Toast.show({
        type: 'info',
        text2: strings.client.home.accountVerificationInProgress,
        duration: 4500,
      });
      return;
    }

    Keyboard.dismiss();
    setShowPin(true);
  };

  const handlePayment = async (_pin: string, _encryptedPin?: string) => {
    const encPin = _encryptedPin || encryptPin(_pin).encryptedPin;
    setIsVerifyingPin(true);
    setPinError(undefined);

    try {
      devDebugger.log('🔐 [Add Money] Verifying transaction PIN...');
      const verifyRes = await AuthService.verifyTransactionPin({
        transactionPin: encPin,
      });

      if (!verifyRes.success) {
        const errorMsg = verifyRes.message || strings.client.wallet.incorrectPin;
        setPinError(errorMsg);
        Toast.show({ type: 'error', text2: errorMsg });
        return;
      }

      // PIN is verified! Now proceed with adding money
      devDebugger.log('✅ [Add Money] PIN verified, proceeding to add money...');
      setIsLoading(true);
      const payResponse = await PaymentService.addMoney({
        amount: Number(amount),
        paymentMethodId: paymentMethod._id || paymentMethod.id || paymentMethod.paymentMethodId,
      });

      if (payResponse.success) {
        setShowPin(false);
        setShowSuccess(true);
      } else {
        const errorMsg = payResponse.message || t.failedToAddMoney;
        Toast.show({ type: 'error', text2: errorMsg });
      }
    } catch (error: any) {
      devDebugger.log('❌ [Add Money] Error:', error);
      const errorMsg = error?.message || strings.client.wallet.verifyPinFailed;
      setPinError(errorMsg);
      Toast.show({ type: 'error', text2: errorMsg });
    } finally {
      setIsVerifyingPin(false);
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    navigation.pop(2); // Go back to Payment Method or Wallet
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TopHeader title={t.screenTitle} onBack={handleBack} />

        <View style={styles.content}>
          <View style={styles.selectedMethodCard}>
            <Image
              source={iconSource}
              style={styles.methodIcon}
            />
            <View style={styles.methodInfo}>
              <AppText style={styles.methodName}>{methodName}</AppText>
              <AppText style={styles.methodDetails}>{methodDetails}</AppText>
            </View>
          </View>

          <View style={[styles.amountContainer, isOutOfRange && styles.amountContainerError]}>
            <AppText style={styles.amountLabel}>{t.enterAmount}</AppText>
            <View style={styles.amountInputRow}>
              <TextInput allowFontScaling={false} style={[styles.amountInput, amount.length > 0 && styles.activeAmountInput]}
                returnKeyType="done"
                placeholder={`${CURRENCY}0.00`}
                placeholderTextColor="#E5E7EB"
                keyboardType="numeric"
                value={amount ? `${CURRENCY}${amount}` : ''}
                maxLength={11}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setAmount(cleaned);
                }}
                editable={!isLoading}
              />
            </View>
          </View>
          {isOutOfRange ? (
            <AppText style={styles.errorText}>
              {t.amountRangeError(minAmount, maxAmount, CURRENCY)}
            </AppText>
          ) : (
            <AppText style={styles.limitText}>
              {t.limitText(minAmount, maxAmount, CURRENCY)}
            </AppText>
          )}
        </View>

        <View style={styles.footer}>
          <CustomButton
            title={t.addBtn}
            onPress={handleAdd}
            loading={isLoading}
            disabled={!amount || isOutOfRange}
          />
        </View>

        <AddMoneySuccessModal
          visible={showSuccess}
          amount={amount}
          onDone={handleDone}
        />

        {/* PIN Modal */}
        <PinInput
          visible={showPin}
          onClose={() => {
            setShowPin(false);
            setPinError(undefined);
          }}
          loading={isVerifyingPin || isLoading}
          isRandomOrder={true}
          error={pinError}
          title={strings.client.wallet.enterTransactionPin}
          onComplete={(pin, encryptedPin) => handlePayment(pin, encryptedPin)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddMoneyScreen;
