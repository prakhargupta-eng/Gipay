// src/config/apiService.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getBaseUrl, API_ENDPOINTS } from '@config/apiConfig';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  setIsProfileComplete,
  setIsLoggedIn,
  clearStorage
} from '@store/storage';
import { useUserStore } from '@store/useUserStore';
import { devDebugger } from '@utils/devDebugger';
import strings from '@constants/strings';

// 🟦 Response Type Definition
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
  error?: any;
}

// 🚦 Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];
let isShowingSessionAlert = false;
let logoutCallback: (() => void) | null = null;

export const injectLogout = (callback: () => void) => {
  logoutCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 🚪 Handle Logout & redirect
export const handleSessionExpired = (
  title = strings.common.sessionExpiredTitle || 'Session Expired',
  message = strings.common.sessionExpiredMessage || 'Your session has expired. Please login again to continue.'
) => {
  if (isShowingSessionAlert) return;

  // If storage is already cleared, don't show the alert again
  if (!getToken() && !getRefreshToken()) return;

  isShowingSessionAlert = true;

  isRefreshing = false;

  setTimeout(() => {
    Alert.alert(
      title,
      message,
      [
        {
          text: strings.common.logout || 'Logout',
          onPress: () => {
            isShowingSessionAlert = false;
            if (logoutCallback) {
              logoutCallback();
            } else {
              // Fallback if not injected
              clearStorage();
              setIsProfileComplete(false);
              setIsLoggedIn(false);
              useUserStore.getState().clearProfile();
            }
          },
        },
      ],
      { cancelable: false },
    );
  }, 500);
};

// 🔥 Axios Instance
const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 🌐 Check Internet Connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const error = new Error('No internet connection') as any;
      error.isNoInternet = true;
      return Promise.reject(error);
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    devDebugger.log('\n---------------- API REQUEST ----------------');
    devDebugger.log(`🚀 URL: ${config.url}`);
    devDebugger.log(`📍 Base: ${config.baseURL}`);
    devDebugger.log(`🛠️ Method: ${config.method?.toUpperCase()}`);
    devDebugger.log('📦 Params:', config.params);
    if (config.data) {
      devDebugger.log('📤 Body:', config.data);
    }
    devDebugger.log('---------------------------------------------\n');

    return config;
  },
  (error: AxiosError) => {
    devDebugger.log('❌ [API Request Error]', error);
    return Promise.reject(error);
  },
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    devDebugger.log('\n---------------- API RESPONSE ----------------');
    devDebugger.log(`✅ Status: ${response.status} ${response.config.url}`);
    devDebugger.log('📥 Data:', response.data);
    devDebugger.log('----------------------------------------------\n');

    const res = response?.data;
    // Map standard backend response to ApiResponse format
    // Preserve full response if pagination is present to avoid losing total count
    const data = ((res?.results !== undefined || res?.data !== undefined) && res?.pagination !== undefined)
      ? res
      : (res?.results ?? res?.data ?? res);

    return {
      success: true,
      data: data,
      message: res?.message ?? 'Success',
      statusCode: response?.status,
    } as any;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const errData: any = error.response?.data;

    // 🚫 Handle explicitly invalidated sessions (e.g. login from another device)
    if (errData?.error?.code === 'SESSION_INVALIDATED' || errData?.message === 'Session invalidated') {
      handleSessionExpired();
      return Promise.resolve({
        success: false,
        data: null,
        message: errData?.message || 'Session invalidated',
        statusCode: error.response?.status || 401,
      } as any);
    }

    // 🔐 Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      devDebugger.log('🔄 [Auth] Attempting to refresh token...');
      // devDebugger.log('🔑 [Auth] Old Refresh Token:', refreshToken);

      if (!refreshToken) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Assume refresh endpoint expects { refreshToken: string }
        const { data } = await axios.post(`${getBaseUrl()}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken,
        });

        devDebugger.log('📡 [Auth] Refresh Token Response:', JSON.stringify(data, null, 2));


        const responseData = data?.results || data?.data || data;
        const accessToken = responseData?.accessToken || responseData?.token;
        const newRefreshToken = responseData?.refreshToken;

        if (!accessToken) {
          handleSessionExpired();
          return Promise.reject(error);
        }

        // Save new tokens
        setToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
          devDebugger.log('🔁 [Auth] New Refresh Token saved:', newRefreshToken);
        }

        // devDebugger.log('✅ [Auth] Token refresh successful! New Access Token:', accessToken);

        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        devDebugger.error('❌ [Auth] Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standard Error Handling
    let message = strings.common.somethingWentWrong;
    let errorObj = null;
    const statusCode = error.response?.status || 0;

    if ((error as any).isNoInternet) {
      message = strings.common.noInternetConnection;
    } else if (error.response) {
      const errData: any = error.response.data;

      // Detect Cloudflare / 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout
      const isCloudflareError = Boolean(
        errData?.cloudflare_error ||
        errData?.error_name === 'origin_bad_gateway' ||
        errData?.error_code === 502 ||
        (typeof errData?.type === 'string' && errData.type.includes('cloudflare-5xx-errors'))
      );
      const isHtmlResponse = typeof errData === 'string' && (
        errData.includes('<html') ||
        errData.includes('<!DOCTYPE') ||
        errData.includes('502 Bad Gateway') ||
        errData.includes('Bad gateway')
      );
      const isBadGateway = statusCode === 502 || statusCode === 503 || statusCode === 504 || isCloudflareError || (typeof errData?.title === 'string' && errData.title.toLowerCase().includes('bad gateway'));

      if (isBadGateway || isHtmlResponse) {
        message = strings.common.badGateway || strings.common.serverUnreachable || 'Server is temporarily unavailable. Please try again in a moment.';
        errorObj = { code: 'SERVER_UNAVAILABLE', message, statusCode: statusCode || 502 };
      } else {
        let rawMessage: any = null;
        if (typeof errData === 'string') {
          // If response is HTML, don't show raw HTML string to user
          if (!errData.trim().startsWith('<') && !errData.includes('<html>')) {
            rawMessage = errData;
          }
        } else if (errData?.message) {
          rawMessage = errData.message;
        } else if (errData?.error?.message) {
          rawMessage = errData.error.message;
        } else if (typeof errData?.error === 'string') {
          rawMessage = errData.error;
        }

        if (typeof rawMessage === 'string' && rawMessage.trim()) {
          message = rawMessage.trim();
        } else if (statusCode === 429) {
          message = strings.common.tooManyAttempts;
        } else if (statusCode >= 500) {
          message = strings.common.serverUnreachable;
        } else {
          message = strings.common.requestFailedWithStatus(statusCode);
        }

        if (typeof errData?.error === 'object') {
          errorObj = errData.error;
        } else if (statusCode === 429) {
          errorObj = { code: 'auth.tooManyAttempts', message };
        } else {
          errorObj = undefined;
        }
      }
    } else if (error.request) {
      message = strings.common.serverUnreachable;
    } else {
      message = error.message || strings.common.unexpectedError;
    }

    devDebugger.log(`⚠️ [API Error] ${statusCode} ${error.config?.url}`);
    devDebugger.log('📝 Message:', message);

    return Promise.resolve({
      success: false,
      data: null,
      message,
      statusCode,
      error: errorObj,
    } as any);
  },
);

// 📡 API METHODS
class ApiService {
  static async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return api.get(url, { params, ...config });
  }

  static async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return api.post(url, data, config);
  }

  static async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return api.put(url, data, config);
  }

  static async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return api.patch(url, data, config);
  }

  static async delete<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return api.delete(url, { params, ...config });
  }

  /**
   * Enhanced Multipart POST method
   */
  static async postMultipart<T = any>(
    url: string,
    data: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object' && item.uri) {

            // It's a file object
            formData.append(key, {
              uri: item.uri,
              type: item.type || 'image/jpeg',
              name: item.name || 'file.jpg',
            } as any);
          } else {
            formData.append(key, item);
          }
        });
      } else if (value && typeof value === 'object' && value.uri) {
        // Single file object
        formData.append(key, {
          uri: value.uri,
          type: value.type || 'image/jpeg',
          name: value.name || 'file.jpg',
        } as any);
      } else {
        formData.append(key, value);
      }
    });

    return api.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get Presigned URL for S3 upload
   */
  static async getPresignedUrl(fileSize: number, contentType: string, folder: string): Promise<ApiResponse<{ uploadUrl: string, key: string, fileUrl: string }>> {
    return this.post(API_ENDPOINTS.UTIL.PRESIGNED_URL, {
      fileSize,
      contentType,
      folder,
    });
  }


  /**
   * Upload file directly to S3 using PUT
   */
  static async uploadToS3(url: string, localUri: string, fileType: string): Promise<void> {
    try {
      // 1. Convert local file to Blob
      const response = await fetch(localUri);
      const blob = await response.blob();

      // 2. Upload to S3 using PUT
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        devDebugger.error('S3 Upload Error Response:', errorText);
        throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
      }

      devDebugger.log('✅ S3 Upload Successful');
    } catch (error) {
      devDebugger.error('❌ [uploadToS3] Error:', error);
      throw error;
    }
  }
}

/**
 * Utility to extract user-friendly error messages from any API response or caught error
 */
export const getApiErrorMessage = (error: any, fallbackMessage: string = strings.common.somethingWentWrong): string => {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;

  const status = error?.response?.status || error?.statusCode || error?.status;
  const data = error?.response?.data || error?.data;

  // Cloudflare 502 / Bad Gateway check
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    data?.cloudflare_error ||
    data?.error_name === 'origin_bad_gateway' ||
    data?.error_code === 502 ||
    (typeof data?.title === 'string' && data.title.toLowerCase().includes('bad gateway')) ||
    (typeof data === 'string' && (data.includes('502 Bad Gateway') || data.includes('<html')))
  ) {
    return strings.common.badGateway || strings.common.serverUnreachable;
  }

  if (error?.message && typeof error.message === 'string' && !error.message.includes('status code 502')) {
    return error.message;
  }

  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  return fallbackMessage;
};

export default ApiService;