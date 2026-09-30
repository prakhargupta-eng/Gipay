import 'react-native-get-random-values';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';
import { NativeModules, TurboModuleRegistry } from 'react-native';
import { devDebugger } from '@utils/devDebugger';

let storage: MMKV;

export const initializeSecureStorage = async (): Promise<void> => {
  try {
    let credentials = await Keychain.getGenericPassword({ service: 'MMKV_KEY' });
    let key;
    if (credentials) {
      key = credentials.password;
    } else {
      const RNGetRandomValues = TurboModuleRegistry 
        ? TurboModuleRegistry.getEnforcing('RNGetRandomValues') 
        : NativeModules.RNGetRandomValues;
      key = RNGetRandomValues.getRandomBase64(32);
      
      const success = await Keychain.setGenericPassword('mmkv', key, { service: 'MMKV_KEY' });
      if (!success) {
        throw new Error('Failed to save key to Keychain');
      }
    }
    storage = createMMKV({ id: 'secure-storage', encryptionKey: key });
  } catch (error) {
    devDebugger.error('Failed to initialize secure storage:', error);
    throw new Error('Security Error: Cannot initialize secure storage.');
  }
};

// --- Generic Helpers ---

// Set a string value 
export const setString = (key: string, value: string): boolean => {
  try {
    storage.set(key, value);
    devDebugger.log(`MMKV: Successfully set string for key ${key}`);
    return true;
  } catch (error) {
    devDebugger.error(`MMKV: Error setting string for key ${key}`, error);
    return false;
  }
};

// Get a string value 
export const getString = (key: string): string | undefined => {
  try {
    return storage.getString(key);
  } catch (error) {
    devDebugger.error(`MMKV: Error getting string for key ${key}`, error);
    return undefined;
  }
};

// Set a boolean value 
export const setBoolean = (key: string, value: boolean): boolean => {
  try {
    storage.set(key, value);
    return true;
  } catch (error) {
    devDebugger.error(`MMKV: Error setting boolean for key ${key}`, error);
    return false;
  }
};

// Get a boolean value 
export const getBoolean = (key: string): boolean => {
  try {
    return storage.getBoolean(key) ?? false;
  } catch (error) {
    devDebugger.error(`MMKV: Error getting boolean for key ${key}`, error);
    return false;
  }
};

// Set a number value 
export const setNumber = (key: string, value: number): boolean => {
  try {
    storage.set(key, value);
    return true;
  } catch (error) {
    devDebugger.error(`MMKV: Error setting number for key ${key}`, error);
    return false;
  }
};

// Get a number value 
export const getNumber = (key: string): number => {
  try {
    return storage.getNumber(key) ?? 0;
  } catch (error) {
    devDebugger.error(`MMKV: Error getting number for key ${key}`, error);
    return 0;
  }
};

// Set an object (automatically stringified) 
export const setObject = (key: string, value: any): boolean => {
  try {
    const jsonValue = JSON.stringify(value);
    storage.set(key, jsonValue);
    return true;
  } catch (error) {
    devDebugger.error(`MMKV: Error setting object for key ${key}`, error);
    return false;
  }
};

// Get an object (automatically parsed) 
export const getObject = <T = any>(key: string): T | null => {
  try {
    const jsonValue = storage.getString(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    devDebugger.error(`MMKV: Error getting object for key ${key}`, error);
    return null;
  }
};

export const deleteKey = (key: string): boolean => {
  try {
    storage.remove(key);
    return true;
  } catch (error) {
    devDebugger.error(`MMKV: Error deleting key ${key}`, error);
    return false;
  }
};

export const hasKey = (key: string): boolean => {
  try {
    return storage.contains(key);
  } catch (error) {
    devDebugger.error(`MMKV: Error checking key ${key}`, error);
    return false;
  }
};

export const getAllKeys = (): string[] => {
  try {
    return storage.getAllKeys();
  } catch (error) {
    devDebugger.error('MMKV: Error getting all keys', error);
    return [];
  }
};

// Clear all storage 
export const clearStorageAll = (): boolean => {
  try {
    storage.clearAll();
    return true;
  } catch (error) {
    devDebugger.error('MMKV: Error clearing storage', error);
    return false;
  }
};

// Optional: Encryption (if needed) 
export const enableEncryption = (encryptionKey: string): boolean => {
  try {
    storage.recrypt(encryptionKey);
    return true;
  } catch (error) {
    devDebugger.error('MMKV: Error enabling encryption', error);
    return false;
  }
};

// --- App Specific Helpers ---

export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_TYPE: 'user_type',
  IS_LOGGED_IN: 'is_logged_in',
  IS_INTRO_SEEN: 'is_intro_seen',
  INTRO_SEEN_CLIENT: 'intro_seen_client',
  INTRO_SEEN_CONTRACTOR: 'intro_seen_contractor',
  IS_PROFILE_COMPLETE: 'is_profile_complete',
  USER_ID: 'user_id',
  LAST_ONBOARDING_STEP: 'last_onboarding_step',
  PERSISTED_ROLE: 'persisted_role',
  HAS_ASKED_NOTIFICATIONS: 'has_asked_notifications',
  KYC_STEP2_DATA: 'kyc_step2_data',
  USERNAME: 'user_full_name',
  CACHED_CONTRACTOR_PROFILE: 'cached_contractor_profile',
  CACHED_CLIENT_PROFILE: 'cached_client_profile',
  NOTIFICATION_ENABLED: 'notification_enabled',
};

export const setIsIntroSeen = (value: boolean) => {
  storage.set(STORAGE_KEYS.IS_INTRO_SEEN, value);
};

export const getIsIntroSeen = (): boolean => {
  return storage.getBoolean(STORAGE_KEYS.IS_INTRO_SEEN) ?? false;
};

export const setToken = (token: string) => {
  storage.set(STORAGE_KEYS.TOKEN, token);
};

export const setIsProfileComplete = (value: boolean) => {
  storage.set(STORAGE_KEYS.IS_PROFILE_COMPLETE, value);
};

export const getIsProfileComplete = (): boolean => {
  return storage.getBoolean(STORAGE_KEYS.IS_PROFILE_COMPLETE) ?? false;
};

export const setIntroSeen = (type: 'client' | 'contractor', value: boolean = true) => {
  const key =
    type === 'client'
      ? STORAGE_KEYS.INTRO_SEEN_CLIENT
      : STORAGE_KEYS.INTRO_SEEN_CONTRACTOR;

  storage.set(key, value);
};

export const getIntroSeen = (type: 'client' | 'contractor'): boolean => {
  const key =
    type === 'client'
      ? STORAGE_KEYS.INTRO_SEEN_CLIENT
      : STORAGE_KEYS.INTRO_SEEN_CONTRACTOR;

  return storage.getBoolean(key) ?? false;
};

export const getToken = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.TOKEN);
};

export const setRefreshToken = (token: string) => {
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setUserType = (type: 'client' | 'contractor' | null) => {
  if (type) {
    storage.set(STORAGE_KEYS.USER_TYPE, type);
  } else {
    storage.remove(STORAGE_KEYS.USER_TYPE);
  }
};

export const getUserType = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.USER_TYPE);
};

export const setIsLoggedIn = (value: boolean) => {
  storage.set(STORAGE_KEYS.IS_LOGGED_IN, value);
};

export const getIsLoggedIn = (): boolean => {
  return storage.getBoolean(STORAGE_KEYS.IS_LOGGED_IN) ?? false;
};

export const setUserId = (id: string) => {
  storage.set(STORAGE_KEYS.USER_ID, id);
};

export const getUserId = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.USER_ID);
};

export const setLastOnboardingStep = (step: string) => {
  storage.set(STORAGE_KEYS.LAST_ONBOARDING_STEP, step);
};

export const getLastOnboardingStep = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.LAST_ONBOARDING_STEP);
};

export const setPersistedRole = (type: 'client' | 'contractor' | null) => {
  if (type) {
    storage.set(STORAGE_KEYS.PERSISTED_ROLE, type);
  } else {
    storage.remove(STORAGE_KEYS.PERSISTED_ROLE);
  }
};

export const getPersistedRole = (): 'client' | 'contractor' | undefined => {
  return storage.getString(STORAGE_KEYS.PERSISTED_ROLE) as 'client' | 'contractor' | undefined;
};

export const setHasAskedNotifications = (value: boolean) => {
  storage.set(STORAGE_KEYS.HAS_ASKED_NOTIFICATIONS, value);
};

export const getHasAskedNotifications = (): boolean => {
  return storage.getBoolean(STORAGE_KEYS.HAS_ASKED_NOTIFICATIONS) ?? false;
};

export const setNotificationEnabled = (value: boolean) => {
  storage.set(STORAGE_KEYS.NOTIFICATION_ENABLED, value);
};

export const getNotificationEnabled = (): boolean => {
  return storage.getBoolean(STORAGE_KEYS.NOTIFICATION_ENABLED) ?? true;
};

export const setUsername = (name: string) => {
  storage.set(STORAGE_KEYS.USERNAME, name);
};

export const getUsername = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.USERNAME);
};

export const setCachedContractorProfile = (profile: any) => {
  setObject(STORAGE_KEYS.CACHED_CONTRACTOR_PROFILE, profile);
};

export const getCachedContractorProfile = (): any | null => {
  return getObject(STORAGE_KEYS.CACHED_CONTRACTOR_PROFILE);
};

export const setCachedClientProfile = (profile: any) => {
  setObject(STORAGE_KEYS.CACHED_CLIENT_PROFILE, profile);
};

export const getCachedClientProfile = (): any | null => {
  return getObject(STORAGE_KEYS.CACHED_CLIENT_PROFILE);
};



export const clearStorage = () => {
  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  storage.remove(STORAGE_KEYS.USER_TYPE);
  storage.remove(STORAGE_KEYS.IS_LOGGED_IN);
  storage.remove(STORAGE_KEYS.IS_PROFILE_COMPLETE);
  storage.remove(STORAGE_KEYS.USER_ID);
  storage.remove(STORAGE_KEYS.LAST_ONBOARDING_STEP);
  storage.remove(STORAGE_KEYS.USERNAME);
  storage.remove(STORAGE_KEYS.KYC_STEP2_DATA);
  storage.remove(STORAGE_KEYS.PERSISTED_ROLE);
  storage.remove(STORAGE_KEYS.CACHED_CONTRACTOR_PROFILE);
  storage.remove(STORAGE_KEYS.CACHED_CLIENT_PROFILE);
};
