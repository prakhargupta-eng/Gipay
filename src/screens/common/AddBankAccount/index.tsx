import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PaymentService from '@config/paymentService';
import TopHeader from '@components/TopHeader';
import InputField from '@components/InputField';
import styles from './styles';
import strings from '@constants/strings';
import AuthService from '@config/authService';
import ContractorService from '@config/contractorService';
import { Toast } from '@utils/ToastManager';
import CustomButton from '@components/CustomButton';
import DropdownField from '@components/DropdownField';
import { useAuth } from '@context/AuthContext';
import { devDebugger } from '@utils/devDebugger';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatBankAccountNumber = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const AddBankAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isUpdate = route.params?.isUpdate || false;
  const updateItem = route.params?.item;
  const isComingFrom = route.params?.isComingFrom || 'profile';

  const [accountHolderName, setAccountHolderName] = useState(updateItem?.accountHolderName || '');
  const { userId } = useAuth();

  const [bankName, setBankName] = useState(updateItem?.bankName || '');
  const [branchName, setBranchName] = useState(updateItem?.branchName || '');
  const [accountNumber, setAccountNumber] = useState(() => {
    const rawVal = updateItem?.accountNumber || updateItem?.bankAccountNumber || '';
    return formatBankAccountNumber(rawVal);
  });
  const [routingNumber, setRoutingNumber] = useState(updateItem?.routingNumber || updateItem?.bankRoutingNumber || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => navigation.goBack();

  const [bankList, setBankList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);

  const [selectedBankId, setSelectedBankId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = strings.validation.fieldEmpty;
    } else if (!/^[a-zA-Z\s]+$/.test(accountHolderName)) {
      newErrors.accountHolderName = strings.validation.alphabetsOnly;
    }

    if (!bankName.trim()) {
      newErrors.bankName = strings.validation.fieldEmpty;
    }

    const cleanAccountNumber = onlyDigits(accountNumber);
    if (!cleanAccountNumber) {
      newErrors.accountNumber = strings.validation.fieldEmpty;
    } else if (cleanAccountNumber.length !== 14) {
      newErrors.accountNumber = strings.common.addBankAccount.accountNumberLength;
    }

    if (!routingNumber.trim()) {
      newErrors.routingNumber = strings.validation.fieldEmpty;
    } else if (!/^\d{8,9}$/.test(routingNumber)) {
      newErrors.routingNumber = strings.common.addBankAccount.routingNumberLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    getBanks();
  }, []);

  const handleAddAccount = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      let response;
      if (isUpdate) {
        if (isComingFrom === 'client') {
          const id = updateItem.id || updateItem.paymentMethodId;
          response = await PaymentService.updateClientBank(id, {
            bankName: selectedBankId,
            branchName: selectedBranchId,
            accountHolderName,
            bankAccountNumber: onlyDigits(accountNumber),
            bankRoutingNumber: routingNumber,
          });
        } else {
          // Contractor Update Bank
          response = await ContractorService.updateBankInfo({
            userId,
            bankId: updateItem?.paymentMethodId,
            accountHolderName,
            bankName: selectedBankId,
            branchName: selectedBranchId,
            accountNumber: onlyDigits(accountNumber),
            routingNumber,
          });
        }
      } else {
        if (isComingFrom === 'client') {
          response = await AuthService.addClientBank({
            bankName: selectedBankId,
            branchName: selectedBranchId,
            accountHolderName,
            bankAccountNumber: onlyDigits(accountNumber),
            bankRoutingNumber: routingNumber,
          });
        } else {
          // Contractor Add Bank
          response = await ContractorService.addBankInfo({
            bankName: selectedBankId,
            branchName: selectedBranchId,
            accountHolderName,
            accountNumber: onlyDigits(accountNumber),
            routingNumber,
          });
        }
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: strings.common.success,
          text2: isUpdate ? strings.common.addBankAccount.bankUpdatedSuccess : strings.common.addBankAccount.bankAddedSuccess
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: strings.common.error,
          text2: response.message || (isUpdate ? strings.common.addBankAccount.failedUpdateBank : strings.common.addBankAccount.failedAddBank)
        });
      }
    } catch (error) {
      devDebugger.error(`Error ${isUpdate ? 'updating' : 'adding'} bank account:`, error);
      Toast.show({
        type: 'error',
        text1: strings.common.error,
        text2: strings.common.addBankAccount.unexpectedError
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBanks = async () => {
    try {
      const response =
        await PaymentService.getFinancialInstitutions();


      if (response?.success) {
        const banks =
          (response?.data as any)?.financialInstitutions?.map((item: any) => ({
            id: item.id,
            value: item.description,
            bankNumber: item.bankNumber,
            financialInstitutionId: item.financialInstitutionId,
          })) || [];

        if (isUpdate) {
          const selectedBank = banks.find(
            (item: any) => item.value === updateItem?.bankName,
          );
          devDebugger.log('selectedBank found =>', selectedBank);
          if (selectedBank) {
            setSelectedBankId(selectedBank.id);
            getBranches(selectedBank.id);
          }
          // get branch name
        }
        setBankList(banks);

      }
    } catch (error) {
      devDebugger.log('Get Banks Error =>', error);
    }
  };

  const getBranches = async (
    financialInstitutionId: string,
  ) => {
    try {
      const response = await PaymentService.getBranches(
        financialInstitutionId,
      );


      if (response?.success) {
        const formattedBranches =
          response?.data?.branches?.map((item: any) => ({
            id: item.id,
            value: `${item.cityName} - ${item.address1}`,
            routingNumber: item.routingNumber,
            originalData: item,
          })) || [];

        setBranchList(formattedBranches);

        if (formattedBranches.length === 0) {
          Toast.show({
            type: 'info',
            text2: strings.common.addBankAccount.noBranchesAvailable,
          });
        }

        if (isUpdate) {
          const selectedBranch = formattedBranches.find(
            (item: any) =>
              item.originalData.description === updateItem?.branchName,
          );

          if (selectedBranch) {
            setSelectedBranchId(selectedBranch.id);
            setBranchName(selectedBranch.value);
            setRoutingNumber(selectedBranch.routingNumber);
          }
        }
      }
    } catch (error) {
      devDebugger.log('Get Branches Error =>', error);
    }
  };

  useEffect(() => {
    if (routingNumber && routingNumber.trim() && errors.routingNumber) {
      setErrors(prev => ({ ...prev, routingNumber: '' }));
    }
  }, [routingNumber, errors.routingNumber]);

  // ===================== api end ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TopHeader title={isUpdate ? strings.common.addBankAccount.updateBankInfo : strings.common.addBankAccount.addBankAccount} onBack={handleBack} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <InputField
              label={strings.common.addBankAccount.accountHolderName}
              placeholder={strings.common.addBankAccount.enterAccountHolderName}
              value={accountHolderName}
              onChangeText={(text) => {
                setAccountHolderName(text);
                if (errors.accountHolderName && text.trim()) {
                  setErrors(prev => ({ ...prev, accountHolderName: '' }));
                }
              }}
              error={errors.accountHolderName}
              wrapperStyle={styles.fieldWrapper}
            />

            <DropdownField
              label={strings.common.addBankAccount.bankName}
              data={bankList.map((item: any) => ({
                label: item.value,
                value: item.id,
              }))}
              value={selectedBankId}
              onChange={(bankId) => {
                const selectedBank = bankList.find(
                  (item: any) => item.id === bankId,
                );
                devDebugger.log('selectedBank =>', selectedBankId);
                setSelectedBankId(bankId);
                setBankName(selectedBank?.value || '');

                setSelectedBranchId('');
                setBranchList([]);
                setRoutingNumber('');
                //api callling to get branches
                getBranches(bankId);

                if (errors.bankName) {
                  setErrors(prev => ({ ...prev, bankName: '' }));
                }
              }}
              error={errors.bankName}
              wrapperStyle={styles.fieldWrapper}
            />

            {!selectedBankId ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Toast.show({
                    type: 'info',
                    text2: strings.common.addBankAccount.selectBankFirst,
                  });
                }}
              >
                <View pointerEvents="none">
                  <InputField
                    label={strings.common.addBankAccount.branchName}
                    placeholder={strings.common.addBankAccount.select}
                    value=""
                    disabled={false}
                    renderRightIcon={() => (
                      <Image
                        source={require('@assets/images/common/dropdown.png')}
                        style={{ width: 14, height: 14, tintColor: '#A0A0A0' }}
                        resizeMode="contain"
                      />
                    )}
                    wrapperStyle={styles.fieldWrapper}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <DropdownField
                label={strings.common.addBankAccount.branchName}
                data={branchList.map((item: any) => ({
                  label: item.value,
                  value: item.id,
                }))}
                value={selectedBranchId}
                onChange={(branchId) => {
                  setSelectedBranchId(branchId);

                  const selectedBranch = branchList.find(
                    (item: any) => item.id === branchId,
                  );

                  if (selectedBranch) {
                    setBranchName(selectedBranch.value);
                    setRoutingNumber(selectedBranch.routingNumber);
                  }

                  if (errors.branchName) {
                    setErrors(prev => ({ ...prev, branchName: '' }));
                  }
                }}
                error={errors.branchName}
                wrapperStyle={styles.fieldWrapper}
              />
            )}

            <InputField
              label={strings.common.addBankAccount.accountNumber}
              placeholder="0000 0000 0000 0000"
              value={accountNumber}
              onChangeText={(text) => {
                const formatted = formatBankAccountNumber(text);
                setAccountNumber(formatted);
                if (errors.accountNumber && formatted.trim()) {
                  setErrors(prev => ({ ...prev, accountNumber: '' }));
                }
              }}
              keyboardType="numeric"
              returnKeyType='done'
              maxLength={17}
              error={errors.accountNumber}
              wrapperStyle={styles.fieldWrapper}
            />

            <InputField
              label={strings.common.addBankAccount.routingNumber}
              placeholder={strings.common.addBankAccount.routingNumber}
              value={routingNumber}
              onChangeText={(text) => {
                setRoutingNumber(text);
                if (errors.routingNumber && text.trim()) {
                  setErrors(prev => ({ ...prev, routingNumber: '' }));
                }
              }}
              keyboardType="numeric"
              error={errors.routingNumber}
              wrapperStyle={styles.fieldWrapper}
              editable={false}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <CustomButton
          title={isUpdate ? strings.common.addBankAccount.updateBank : strings.common.addBankAccount.addAccount}
          onPress={handleAddAccount}
          loading={isLoading}
        />
      </View>
    </View>
  );
};

export default AddBankAccountScreen;
