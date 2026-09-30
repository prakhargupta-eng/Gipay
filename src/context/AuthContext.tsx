import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as Storage from '@store/storage';
import { useSystemStore } from '@store/useSystemStore';
import { useUserStore } from '@store/useUserStore';

export type AuthStatus = 'LOADING' | 'UNAUTH' | 'AUTH';
export type UserType = 'client' | 'contractor' | null;

interface AuthContextType {
  authStatus: AuthStatus;
  userType: UserType;
  preferredAuthScreen: 'login' | 'signup' | null;
  isProfileComplete: boolean;
  isIntroSeen: boolean;
  userId: string | null;
  lastOnboardingStep: string | null;
  username: string | null;
  persistedRole: UserType;
  signIn: (token: string, refreshToken: string, userId: string) => void;
  signOut: () => void;
  setUserFlow: (type: UserType, screen?: 'login' | 'signup') => void;
  updatePersistedRole: (type: UserType) => void;
  updateLastStep: (step: string) => void;
  saveName: (username: string) => void;
  completeProfile: () => void;
  setIntroSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('LOADING');
  const [userType, setUserTypeState] = useState<UserType>(null);
  const [preferredAuthScreen, setPreferredAuthScreen] = useState<'login' | 'signup' | null>(null);
  const [isProfileComplete, setIsProfileCompleteState] = useState(false);
  const [isIntroSeen, setIsIntroSeenState] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [lastOnboardingStep, setLastOnboardingStepState] = useState<string | null>(null);
  const [persistedRole, setPersistedRoleState] = useState<UserType>(null);

  useEffect(() => {
    const loadState = () => {
      const storedToken = Storage.getToken();
      const storedUserType = Storage.getUserType() as UserType;
      const storedProfileComplete = Storage.getIsProfileComplete();
      const storedIntroSeen = Storage.getIsIntroSeen();
      const storedIsLoggedIn = Storage.getIsLoggedIn();
      const storedUserId = Storage.getUserId();
      const storedLastStep = Storage.getLastOnboardingStep();
      const storedPersistedRole = Storage.getPersistedRole() as UserType;
      const storedUsername = Storage.getUsername();

      setLastOnboardingStepState(storedLastStep || null);
      setPersistedRoleState(storedPersistedRole || null);
      setIsIntroSeenState(storedIntroSeen);
      setUsernameState(storedUsername || null);

      // Increase Splash Screen Time: 
      // Delaying the auth status transition by 2000ms
      setTimeout(() => {
        if (storedToken && storedIsLoggedIn) {
          setUserTypeState(storedUserType);
          setIsProfileCompleteState(storedProfileComplete);
          setUserIdState(storedUserId || null);
          setAuthStatus('AUTH');
        } else {
          Storage.setUserType(null); // Reset transient navigation type
          setUserTypeState(null);
          setAuthStatus('UNAUTH');
        }
      }, 2000);
    };

    loadState();
  }, []);

  const signIn = useCallback((token: string, refreshToken: string, userId: string) => {
    Storage.setToken(token);
    Storage.setRefreshToken(refreshToken);
    Storage.setUserId(userId);
    Storage.setIsLoggedIn(true);
    setUserIdState(userId);
    setAuthStatus('AUTH');
  }, []);

  const signOut = useCallback(() => {
    Storage.clearStorage();
    Storage.setIsProfileComplete(false);
    Storage.setIsLoggedIn(false);
    useSystemStore.getState().clearSettings();
    useUserStore.getState().clearProfile();
    setAuthStatus('UNAUTH');
    setUserTypeState(null);
    setIsProfileCompleteState(false);
    setUserIdState(null);
    setUsernameState(null);
  }, []);

  const setUserFlow = useCallback((type: UserType, screen: 'login' | 'signup' | null = null) => {
    if (type) {
      setPersistedRoleState(type);
      Storage.setPersistedRole(type);
    }
    Storage.setUserType(type);
    setUserTypeState(type);
    setPreferredAuthScreen(screen);
  }, []);

  const updatePersistedRole = useCallback((type: UserType) => {
    if (type) {
      setPersistedRoleState(type);
      Storage.setPersistedRole(type);
    }
  }, []);

  const updateLastStep = useCallback((step: string) => {
    Storage.setLastOnboardingStep(step);
    setLastOnboardingStepState(step);
  }, []);

  const saveName = useCallback((username: string) => {
    Storage.setUsername(username);
    setUsernameState(username);
  }, []);

  const completeProfile = useCallback(() => {
    Storage.setIsProfileComplete(true);
    setIsProfileCompleteState(true);
    Storage.setLastOnboardingStep(''); // Reset on completion
    setLastOnboardingStepState(null);
  }, []);

  const setIntroSeen = useCallback(() => {
    Storage.setIsIntroSeen(true);
    setIsIntroSeenState(true);
  }, []);

  const authContextValue = useMemo(() => ({
    authStatus,
    userType,
    preferredAuthScreen,
    isProfileComplete,
    isIntroSeen,
    userId,
    lastOnboardingStep,
    persistedRole,
    username,
    signIn,
    signOut,
    setUserFlow,
    updatePersistedRole,
    updateLastStep,
    saveName,
    completeProfile,
    setIntroSeen,
  }), [
    authStatus,
    userType,
    preferredAuthScreen,
    isProfileComplete,
    isIntroSeen,
    userId,
    lastOnboardingStep,
    persistedRole,
    username,
    signIn,
    signOut,
    setUserFlow,
    updatePersistedRole,
    updateLastStep,
    saveName,
    completeProfile,
    setIntroSeen
  ]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
