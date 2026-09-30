import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetupOrganizationScreen from '@screens/client/auth/setupOrganization/SetupOrganizationScreen';
import { useAuth } from '@context/AuthContext';

export type ClientProfileStackParamList = {
  setupOrganization: undefined;
  paymentInfo: undefined;
};

const Stack = createNativeStackNavigator<ClientProfileStackParamList>();

const ClientProfileStack = () => {
  const { lastOnboardingStep } = useAuth();

  const initialRoute: keyof ClientProfileStackParamList =
    lastOnboardingStep === 'paymentInfo' ? 'paymentInfo' : 'setupOrganization';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="setupOrganization" component={SetupOrganizationScreen} />
    </Stack.Navigator>
  );
};

export default ClientProfileStack;
