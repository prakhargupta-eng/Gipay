import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '@screens/client/auth/login/loginScreen';
import SignUpScreen from '@screens/client/auth/signup/SignUpScreen';
import ForgotPasswordScreen from '@screens/client/auth/forgotPassword/forget/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/client/auth/forgotPassword/resetPassword/ResetPasswordScreen';
import VerifyCodeScreen from '@screens/client/auth/forgotPassword/verify/VerifyCodeScreen';
import OTPVerificationScreen from '@screens/client/auth/otp/OTPScreen';

export type ClientAuthStackParamList = {
  login: undefined;
  signUp: undefined;

  forgotPassword: undefined;
  verifyCode: {
    email?: string,
    mobile?: string,
    countryCode?: number,
    otpId?: string,
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate' | 'mobile-update' | 'client' | 'contractor',
    role?: 'client' | 'contractor',
    expiresIn?: number
  };
  resetPassword: { email: string, otpId: string };
  otpverification: {
    email: string;
    otpId?: string;
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate' | 'client' | 'contractor';
    expiresIn?: number;
  };
};

import { useAuth } from '@context/AuthContext';

const Stack = createNativeStackNavigator<ClientAuthStackParamList>();

const ClientAuthStack = () => {
  const { preferredAuthScreen } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={preferredAuthScreen === 'signup' ? 'signUp' : 'login'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signUp" component={SignUpScreen} />
      <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="verifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="resetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="otpverification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
};

export default ClientAuthStack;
