import { formatCurrency } from '@utils/currencyUtils';
// src/screens/contractor/tabview/wallet/WithdrawAmount/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, TextInput, Modal, StatusBar, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import LinearGradient from '@components/LinearGradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from '@styles/mixins';

import TopHeader from '@components/TopHeader';
import strings, { CURRENCY } from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import AppText from '@components/AppText';
import { ContractorAppStackParamList } from '@navigation/contractor/ContractorAppStack';
import PaymentService, { SecurityQuestion } from '@config/paymentService';
import { Toast } from '@utils/ToastManager';
import { useSystemStore } from '@store/useSystemStore';
import DropdownField from '@components/DropdownField';
import MobileInput from '@components/MobileInput';
import AuthService from '@config/authService';
import LottieView from 'lottie-react-native';
import CustomToast from '@components/CustomToast';
import { devDebugger } from '@utils/devDebugger';
import ContractorService from '@config/contractorService';
import PinInput from '@components/PinInput';
import { encryptPin } from '@utils/cryptoUtils';

type WithdrawAmountRouteProp = RouteProp<ContractorAppStackParamList, 'WithdrawAmount'>;

const WithdrawAmount = () => {
    const navigation = useNavigation();
    const route = useRoute<WithdrawAmountRouteProp>();
    const insets = useSafeAreaInsets();
    const availableBalance = route.params?.availableBalance ?? 0;

    const confirmToastRef = useRef<any>(null);
    const successToastRef = useRef<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const [selectedMethod, setSelectedMethod] = useState<'standard' | 'instant'>('standard');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Transaction PIN State
    const [showPinModal, setShowPinModal] = useState(false);
    const [isVerifyingPin, setIsVerifyingPin] = useState(false);
    const [pinError, setPinError] = useState<string | undefined>(undefined);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);
    const [amount, setAmount] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const [banks, setBanks] = useState<any[]>([]);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('1');
    const [countryCodesList, setCountryCodesList] = useState<{ label: string; value: string }[]>([]);

    const { settings, fetchSettings } = useSystemStore();

    const fetchBanks = async () => {
        try {
            setLoadingBanks(true);
            const res = await PaymentService.getContractorBanks();
            if (res.success && res.data) {
                const results = res.data;
                let data: any[] = [];
                if (Array.isArray(results)) {
                    data = results;
                } else if (Object.keys(results).length > 0) {
                    data = [results];
                }
                setBanks(data);
                if (data.length > 0) {
                    setSelectedBank(data[0]);
                }
            }
        } catch (error) {
            devDebugger.error('Failed to fetch contractor banks:', error);
        } finally {
            setLoadingBanks(false);
        }
    };

    const fetchSecurityQuestions = async () => {
        try {
            setLoadingQuestions(true);
            const res = await PaymentService.getSecurityQuestions();
            if (res.success && res.data?.questions) {
                const questions = res.data.questions;
                setSecurityQuestions(questions);
                if (questions.length > 0) {
                    setSelectedQuestionId(questions[0]._id);
                }
            }
        } catch (error) {
            devDebugger.error('Failed to fetch security questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const fetchCountryCodes = async () => {
        try {
            const response: any = await AuthService.getCountryCodes();

            // Robust extraction to handle various API response structures
            let resultsArray: any[] = [];
            if (Array.isArray(response.results)) {
                resultsArray = response.results;
            } else if (response.data && Array.isArray(response.data.results)) {
                resultsArray = response.data.results;
            } else if (response.data?.results && Array.isArray(response.data.results.results)) {
                resultsArray = response.data.results.results;
            } else if (Array.isArray(response.data)) {
                resultsArray = response.data;
            } else if (Array.isArray(response)) {
                resultsArray = response;
            }

            if (resultsArray.length > 0) {
                const mapped = resultsArray.map((item: any) => ({
                    label: `+${item.countryCode}`,
                    value: String(item.countryCode)
                }));
                setCountryCodesList(mapped);
            }
        } catch (error) {
            devDebugger.error('Fetch Country Codes Error:', error);
        }
    };

    useEffect(() => {
        fetchBanks();
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (selectedMethod === 'instant') {
            if (securityQuestions.length === 0) fetchSecurityQuestions();
            if (countryCodesList.length === 0) fetchCountryCodes();
        }
    }, [selectedMethod]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isWithdrawing) {
                e.preventDefault();
            }
        });
        return unsubscribe;
    }, [navigation, isWithdrawing]);

    const walletStrings = strings.auth.contractor.wallet;

    const handleSubmit = () => {
        if (!selectedBank) {
            Toast.show({
                type: 'error',
                text2: walletStrings.selectBankError,
            });
            return;
        }
        const rawAmount = amount.replace(/,/g, '');
        const numericAmount = Number(rawAmount);
        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            Toast.show({
                type: 'error',
                text2: walletStrings.enterAmountError,
            });
            return;
        }

        const minAmount = settings?.withdrawalMin ?? 1;
        const maxAmount = settings?.withdrawalMax ?? 10;

        if (numericAmount < minAmount || numericAmount > maxAmount) {
            Toast.show({
                type: 'error',
                text2: walletStrings.amountRangeError(minAmount, maxAmount, CURRENCY),
            });
            return;
        }
        if (numericAmount > availableBalance) {
            Toast.show({
                type: 'error',
                text2: walletStrings.insufficientBalanceError,
            });
            return;
        }
        if (selectedMethod === 'instant') {
            if (!selectedQuestionId) {
                Toast.show({
                    type: 'error',
                    text2: walletStrings.selectQuestionError,
                });
                return;
            }
            if (!mobile || mobile.length !== 10) {
                Toast.show({
                    type: 'error',
                    text2: walletStrings.invalidMobileNumberError,
                });
                return;
            }
        }
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        setShowConfirmModal(false);
        setPinError(undefined);
        setShowPinModal(true);
    };

    const handlePinPayment = async (pin: string, encryptedPin?: string) => {
        if (!selectedBank) return;
        const encPin = encryptedPin || encryptPin(pin).encryptedPin;
        setIsVerifyingPin(true);
        setPinError(undefined);

        try {
            devDebugger.log('🔐 [Withdraw Amount] Verifying transaction PIN...');
            const verifyRes = await ContractorService.verifyTransactionPin({
                transactionPin: encPin,
            });

            if (!verifyRes.success) {
                const errorMsg = verifyRes.message || strings.transactionPin.incorrectPin;
                setPinError(errorMsg);
                Toast.show({ type: 'error', text2: errorMsg });
                return;
            }

            devDebugger.log('✅ [Withdraw Amount] PIN verified, proceeding with withdrawal...');
            setIsWithdrawing(true);
            const rawAmount = amount.replace(/,/g, '');
            const payload: Parameters<typeof PaymentService.withdrawContractor>[0] = {
                amount: Number(rawAmount),
                bankAccountId: selectedBank._id || selectedBank.id,
                method: selectedMethod,
            };
            if (selectedMethod === 'instant') {
                const questionObj = securityQuestions.find((q) => q._id === selectedQuestionId);
                if (questionObj) {
                    payload.securityQuestionId = questionObj._id;
                }
                payload.phoneNumber = mobile;
                payload.phoneCountryCode = `${parseInt(countryCode, 10)}`;
            }
            const res = await PaymentService.withdrawContractor(payload);
            if (res.success) {
                setShowPinModal(false);
                setShowSuccessModal(true);
            } else {
                const errorMsg = res.message || walletStrings.withdrawFailed;
                setPinError(errorMsg);
                Toast.show({
                    type: 'error',
                    text2: errorMsg,
                });
            }
        } catch (error: any) {
            devDebugger.log('❌ [Withdraw Amount] Error:', error);
            const errorMsg = error?.message || strings.transactionPin.verifyFailed;
            setPinError(errorMsg);
            Toast.show({
                type: 'error',
                text2: errorMsg,
            });
        } finally {
            setIsVerifyingPin(false);
            setIsWithdrawing(false);
        }
    };

    const getDropdownPlaceholder = () => {
        if (loadingBanks) return walletStrings.loadingBanks;
        if (banks.length === 0) return walletStrings.noBankAccountAdded;
        return walletStrings.selectBank;
    };

    const getSecurityQuestionPlaceholder = () => {
        if (loadingQuestions) return walletStrings.loadingSecurityQuestions;
        if (securityQuestions.length === 0) return walletStrings.noSecurityQuestions;
        return walletStrings.selectSecurityQuestion;
    };

    const minAmount = settings?.withdrawalMin ?? 1;
    const maxAmount = settings?.withdrawalMax ?? 10;
    const numericAmount = Number(amount.replace(/,/g, ''));
    const isOutOfRange = amount.length > 0 && (numericAmount < minAmount || numericAmount > maxAmount);

    useEffect(() => {
        if (isOutOfRange || (isKeyboardVisible && amount.length > 0)) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 180, animated: true });
            }, 100);
        }
    }, [isOutOfRange, isKeyboardVisible, amount]);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <TopHeader
                title={strings.auth.contractor.wallet.withdrawAmount}
                onBack={() => {
                    if (!isWithdrawing) {
                        navigation.goBack();
                    }
                }}
            />

            <View style={styles.content}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: isKeyboardVisible ? 250 : verticalScale(16) }}>
                        {/* Available Balance Card */}
                        <LinearGradient
                            colors={colors.walletGradient}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.earningsCardView}
                        >
                            <View style={styles.availableBalanceCard}>
                                <AppText style={styles.balanceLabel}>{walletStrings.availableBalanceLabel}</AppText>
                                <AppText style={styles.balanceValue}>
                                    {formatCurrency(availableBalance)}
                                </AppText>
                            </View>
                        </LinearGradient>
                        {/* Withdrawal Method */}
                        <AppText style={styles.sectionTitle}>{walletStrings.withdrawalMethod}</AppText>
                        <View style={styles.methodRow}>
                            <TouchableOpacity
                                style={[styles.methodCard, selectedMethod === 'standard' && styles.selectedMethodCard]}
                                onPress={() => {
                                    setSelectedMethod('standard');
                                    setAmount('');
                                    setSelectedBank(null);
                                    setMobile('');
                                }}
                                activeOpacity={0.7}
                            >
                                {selectedMethod === 'standard' && (
                                    <View style={styles.checkIconWrapper}>
                                        <Image source={require('@assets/images/common/check.png')} style={styles.checkIcon} />
                                    </View>
                                )}
                                <View style={styles.methodIconWrapper}>
                                    <Image source={require('@assets/images/client/wallets/standard.png')} style={styles.methodIcon} />
                                </View>
                                <AppText style={styles.methodName}>{walletStrings.standard}</AppText>
                                <AppText style={styles.methodTime}>{walletStrings.standardTime}</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.methodCard, selectedMethod === 'instant' && styles.selectedMethodCard]}
                                onPress={() => {
                                    setSelectedMethod('instant');
                                    setAmount('');
                                    setSelectedBank(null);
                                    setMobile('');
                                }}
                                activeOpacity={0.7}
                            >
                                {selectedMethod === 'instant' && (
                                    <View style={styles.checkIconWrapper}>
                                        <Image source={require('@assets/images/common/check.png')} style={styles.checkIcon} />
                                    </View>
                                )}
                                <View style={styles.methodIconWrapper}>
                                    <Image source={require('@assets/images/client/wallets/instant.png')} style={styles.methodIcon} />
                                </View>
                                <AppText style={styles.methodName}>{walletStrings.instant}</AppText>
                                <AppText style={styles.methodTime}>
                                    {settings?.instantPayoutFeePercent == null
                                        ? walletStrings.instantFee
                                        : `${walletStrings.instantFee} (${settings.instantPayoutFeePercent}% )`}
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        {/* Bank Account Selection */}
                        <View style={styles.inputGroup}>
                            <DropdownField
                                label={walletStrings.bankAccount}
                                placeholder={getDropdownPlaceholder()}
                                data={
                                    banks.length > 0
                                        ? banks.map((bank) => ({ label: bank.bankName, value: bank._id || bank.id }))
                                        : [{ label: walletStrings.noBankAccountAdded, value: 'empty' }]
                                }
                                value={selectedBank?._id || selectedBank?.id}
                                onChange={(bankId) => {
                                    if (bankId === 'empty') return;
                                    const bank = banks.find((b) => (b._id || b.id) === bankId);
                                    setSelectedBank(bank);
                                }}
                                disabled={loadingBanks}
                            />
                        </View>

                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <AppText style={styles.inputLabel}>{walletStrings.withdrawalAmountLabel}</AppText>
                            <TextInput allowFontScaling={false} style={[styles.input, isOutOfRange && styles.inputGroupError]}
                                placeholder={walletStrings.enterAmountPlaceholder}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                returnKeyType="done"
                                maxLength={11}
                                value={amount ? `$${amount}` : ''}
                                onFocus={() => {
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: 180, animated: true });
                                    }, 100);
                                }}
                                onChangeText={(text) => {
                                    let cleaned = text.replace(/[^0-9.]/g, '');
                                    const parts = cleaned.split('.');
                                    if (parts.length > 2) {
                                        cleaned = parts[0] + '.' + parts.slice(1).join('');
                                    }
                                    let formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    if (parts.length > 1) {
                                        formatted += '.' + parts[1].substring(0, 2);
                                    }
                                    setAmount(formatted);
                                }}
                            />
                        </View>
                        {isOutOfRange ? (
                            <AppText style={styles.errorText}>
                                {walletStrings.amountRangeError(minAmount, maxAmount, CURRENCY)}
                            </AppText>
                        ) : (
                            <AppText style={styles.limitText}>
                                {walletStrings.limitText(minAmount, maxAmount, CURRENCY)}
                            </AppText>
                        )}

                        {/* Security Question Input (only for Instant method) */}
                        {selectedMethod === 'instant' && (
                            <View style={styles.inputGroup}>
                                <DropdownField
                                    label={walletStrings.securityQuestionLabel}
                                    placeholder={getSecurityQuestionPlaceholder()}
                                    data={
                                        securityQuestions.length > 0
                                            ? securityQuestions.map((q) => ({ label: q.securityQuestion, value: q._id }))
                                            : [{ label: walletStrings.noSecurityQuestions, value: 'empty' }]
                                    }
                                    value={selectedQuestionId}
                                    onChange={(questionId) => {
                                        if (questionId === 'empty') return;
                                        setSelectedQuestionId(questionId);
                                    }}
                                    disabled={loadingQuestions}
                                />
                                {(() => {
                                    const selectedQ = securityQuestions.find((q) => q._id === selectedQuestionId);
                                    if (!selectedQ) return null;
                                    return (
                                        <View style={styles.questionDisplayContainer}>
                                            <AppText style={styles.questionDisplayText}>
                                                {walletStrings.questionPrefix}{selectedQ.securityQuestion}
                                            </AppText>
                                            <AppText style={styles.answerDisplayText}>
                                                {walletStrings.answerPrefix}{selectedQ.securityQuestionAnswer}
                                            </AppText>
                                        </View>
                                    );
                                })()}

                                {/* Mobile Number Input (only for Instant method) */}
                                <AppText style={[styles.inputLabel, { marginTop: 16 }]}>{walletStrings.mobileNumberLabel}</AppText>
                                <MobileInput
                                    mobile={mobile}
                                    countryCode={String(countryCode).trim()}
                                    countryCodesList={countryCodesList}
                                    onChangeMobile={setMobile}
                                    onChangeCountryCode={setCountryCode}
                                    mobilePlaceholder={walletStrings.enterMobileNumberPlaceholder}
                                    codePlaceholder={walletStrings.countryCodePlaceholder}
                                    hideCheck={true}
                                    containerStyle={{ marginTop: 0 }}
                                />
                            </View>
                        )}

                        {/* Fee Info */}
                        <View style={{ position: 'relative', zIndex: 10 }}>
                            <TouchableOpacity
                                style={styles.feeContainer}
                                activeOpacity={1}
                                onPress={() => setShowTooltip(!showTooltip)}
                            >
                                <View style={styles.feeRow}>
                                    <Image source={require('@assets/images/common/info.png')} style={styles.infoIcon} />
                                    <AppText style={styles.feeText}>
                                        {walletStrings.withdrawalFee(settings?.withdrawalFee == null ? '5' : String(settings.withdrawalFee))
                                        }
                                    </AppText>
                                </View>
                            </TouchableOpacity>

                            {showTooltip && (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => setShowTooltip(false)}
                                    style={styles.feeTooltipContainer}
                                >
                                    <View style={styles.feeTooltipArrowShadow} />
                                    <View style={styles.feeTooltipArrow} />
                                    <AppText style={styles.feeTooltipText}>
                                        {walletStrings.withdrawalFeeNote}
                                    </AppText>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={{ height: verticalScale(16) }} />
                    </ScrollView>
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            {
                                marginBottom: isKeyboardVisible
                                    ? verticalScale(10)
                                    : Math.max(insets.bottom, verticalScale(16)) + verticalScale(6),
                            },
                            (isOutOfRange || !amount) && styles.submitBtnDisabled
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isOutOfRange || !amount}
                    >
                        <AppText style={styles.submitBtnText}>{walletStrings.submit}</AppText>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
            {/* Confirmation Modal */}
            <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ width: 80, height: 80, backgroundColor: '#F0EDFF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <LottieView
                                source={require('@assets/animation/withdraw.json')}
                                autoPlay
                                loop
                                style={{ width: 80, height: 80 }}
                            />
                        </View>
                        <AppText style={styles.modalTitle}>{walletStrings.withdrawConfirmTitle}</AppText>
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => setShowConfirmModal(false)}
                                disabled={isWithdrawing}
                            >
                                <AppText style={styles.modalBtnText}>{walletStrings.no}</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnPrimary]}
                                onPress={handleConfirm}
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <AppText style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>{walletStrings.yes}</AppText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <CustomToast ref={confirmToastRef} />
            </Modal>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LottieView
                            source={require('@assets/animation/Success Check.json')}
                            autoPlay
                            loop={false}
                            style={{ width: 100, height: 100, marginBottom: 20 }}
                        />
                        <AppText style={styles.successTitle}>{formatCurrency(Number(amount.replace(/,/g, '')))}</AppText>
                        <AppText style={styles.successSubTitle}>{walletStrings.withdrawSuccessful}</AppText>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => {
                            setShowSuccessModal(false);
                            navigation.goBack();
                        }}>
                            <AppText style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>{walletStrings.done}</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
                <CustomToast ref={successToastRef} />
            </Modal>

            {/* Transaction PIN Verification Modal */}
            <PinInput
                visible={showPinModal}
                onClose={() => {
                    setShowPinModal(false);
                    setPinError(undefined);
                }}
                loading={isVerifyingPin || isWithdrawing}
                isRandomOrder={true}
                error={pinError}
                title={strings.transactionPin.enterTransactionPinTitle}
                onComplete={(pin, encryptedPin) => handlePinPayment(pin, encryptedPin)}
            />

            {isWithdrawing && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    zIndex: 9999,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </View>
    );
};

export default WithdrawAmount;
