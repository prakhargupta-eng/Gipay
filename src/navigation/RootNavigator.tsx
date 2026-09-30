import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@context/AuthContext';
import { navigationRef } from './NavigationService';
import { useSystemStore } from '@store/useSystemStore';
import NotificationService from '@utils/NotificationService';

// Stacks
import ClientAuthStack from './client/ClientAuthStack';
import ContractorAuthStack from './contractor/ContractorAuthStack';
import ClientProfileStack from './client/ClientProfileStack';
import ContractorProfileStack from './contractor/ContractorProfileStack';
import ClientAppStack from './client/ClientAppStack';
import ContractorAppStack from './contractor/ContractorAppStack';

// Screens
import SplashScreen from '@screens/splash/SplashScreen';
import IntroScreen from '@screens/intro/IntroScreen';
import GetStartedScreen from '@screens/getstarted/getstarted';
import InformationScreen from '@screens/common/InformationScreen';
import { devDebugger } from '@utils/devDebugger';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { authStatus, userType, isProfileComplete, isIntroSeen, setUserFlow, setIntroSeen, userId } = useAuth();
  const { fetchSettings, settings } = useSystemStore();

  useEffect(() => {
    if (authStatus === 'AUTH' && !settings) {
      fetchSettings();
    }
  }, [authStatus]);

  // 1. Splash Logic
  if (authStatus === 'LOADING') {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      key={userId ? `auth-${userId}` : 'unauth'}
      onReady={() => {
        devDebugger.log('Navigation Container ready, processing initial notification if any...');
        NotificationService.processInitialNotification();
      }}
    >
      <Stack.Navigator screenOptions={{
        animation: 'slide_from_right',
        gestureEnabled: true,
        headerShown: false
      }}>
        {/* 2. Unauthenticated Flows */}
        {authStatus === 'UNAUTH' ? (
          !isIntroSeen ? (
            <Stack.Screen name="Intro">
              {(props) => <IntroScreen {...props} onFinish={setIntroSeen} />}
            </Stack.Screen>
          ) : !userType ? (
            // FlowSelectionStack
            <Stack.Screen name="FlowSelection">
              {(props) => (
                <GetStartedScreen
                  {...props}
                  onComplete={(type) => setUserFlow(type, 'signup')}
                  onCompleteLogin={(type) => setUserFlow(type, 'login')}
                />
              )}
            </Stack.Screen>
          ) : userType === 'client' ? (
            <Stack.Screen name="ClientAuth" component={ClientAuthStack} />
          ) : (
            <Stack.Screen name="ContractorAuth" component={ContractorAuthStack} />
          )
        ) : (
          /* 3. Authenticated Flows */
          !isProfileComplete ? (
            userType === 'client' ? (
              <Stack.Screen name="ClientProfile" component={ClientProfileStack} />
            ) : (
              <Stack.Screen name="ContractorProfile" component={ContractorProfileStack} />
            )
          ) : (
            userType === 'client' ? (
              <Stack.Screen name="ClientApp" component={ClientAppStack} />
            ) : (
              <Stack.Screen name="ContractorApp" component={ContractorAppStack} />
            )
          )
        )}
        <Stack.Screen name="Information" component={InformationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
