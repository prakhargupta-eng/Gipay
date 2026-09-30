import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompleteProfileScreen from '@screens/contractor/auth/completeProfile/CompleteProfileScreen';

export type ContractorProfileStackParamList = {
  CompleteProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<ContractorProfileStackParamList>();

const ContractorProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
};

export default ContractorProfileStack;
