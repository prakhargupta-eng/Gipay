import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ContractorLoginScreen from '@screens/contractor/auth/login/ContractorLoginScreen';
import ContractorSignUpScreen from '@screens/contractor/auth/signup/ContractorSignUpScreen';
import ContractorOTPScreen from '@screens/contractor/auth/otp/ContractorOTPScreen';
import ForgotPasswordScreen from '@screens/contractor/auth/forgotPassword/forget/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/contractor/auth/forgotPassword/resetPassword/ResetPasswordScreen';
import VerifyCodeScreen from '@screens/contractor/auth/forgotPassword/verify/VerifyCodeScreen';

export type ContractorAuthStackParamList = {
  ContractorLogin: undefined;
  ContractorSignup: undefined;
  ForgotPassword: undefined;
  ContractorOTP: {
    email?: string,
    mobile?: string,
    countryCode?: number,
    otpId?: string,
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate',
    expiresIn?: number,
  };

  verifyCode: {
    email?: string,
    mobile?: string,
    countryCode?: number,
    otpId?: string,
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate' | 'client' | 'contractor',
    role?: 'client' | 'contractor',
    expiresIn?: number,
  };

  resetPassword: { email: string, otpId: string };
};

import { useAuth } from '@context/AuthContext';

const Stack = createNativeStackNavigator<ContractorAuthStackParamList>();

const ContractorAuthStack = () => {
  const { preferredAuthScreen } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={preferredAuthScreen === 'signup' ? 'ContractorSignup' : 'ContractorLogin'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ContractorLogin" component={ContractorLoginScreen} />
      <Stack.Screen name="ContractorSignup" component={ContractorSignUpScreen} />
      <Stack.Screen name="ContractorOTP" component={ContractorOTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="verifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="resetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default ContractorAuthStack;
