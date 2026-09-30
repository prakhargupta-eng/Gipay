// src/config/authService.ts

import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';
import { getToken } from '@store/storage';

/**
 * Interface Definitions for Payloads (based on screenshots)
 */

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  deviceId?: string;
  deviceType?: string;
  deviceToken?: string;
}

export interface ClientRegisterPayload {
  organisationName: string;
  contactPersonName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  deviceId?: string;
  deviceType?: string;
  deviceToken?: string;
  
}

export interface LoginPayload {
  type: 'contractor' | 'client';
  email: string;
  password: string;
  deviceId?: string;
  deviceType?: string;
  deviceToken?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  type: 'contractor' | 'client' | 'forgotPassword' | 'profileUpdate';
  otpId: string;
  role: 'client' | 'contractor';
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
  otpId: string;
  role: 'client' | 'contractor';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AddCardPayload {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardBrand: string;
}

export interface UpdateClientProfilePayload {
  organisationName: string;
  fullName: string;
  phoneNumber: string;
  countryCode?: string | number;
  companyAddress: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  businessCategory?: string | { id: string; name: string } | { id: string; name: string }[];
  documentUrl?: string;
  documentName?: string;
  profileImage?: string;
  email?: string;
}

export interface IdentityPayload {
  profileImage?: string;
  dateOfBirth: string;
  residentialAddress: string;
  province: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  citizenshipStatus: string;
  workPermit: string;
  visaStatus: string;
}

export interface ProfilePayload {
  workCategory: {
    id: string;
    name: string;
  }
  skills: string[];
  experience: string;
  hourlyRate: string;
  availabilityDays: string[];
  bio: string;
}


export interface BankPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}
//=======================================================================
//province Model
export interface Province {
  id: string;
  name: string;
  countryName: string;
  status: string;
  countryCode: string;
  provinceCode: string;
}

export interface ProvincePagination {
  totalCount: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface ProvincesResponse {
  provinces: Province[];
  pagination: ProvincePagination;
}

//========================================================================


//countries model
export interface Country {
  id: string;
  name: string;
  phoneCode: string;
  numericCode: string;
  status: string;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface CountriesResponse {
  countries: Country[];
  pagination: Pagination;
}

//=========================================================================

/**
 * AuthService Class
 * Centralizes all authentication and contractor onboarding API calls.
 * Role: Hit API, Decode Response, and Provide Typed data.
 */
class AuthService {
  /**
   * Register a new contractor
   */
  static async register(data: RegisterPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.REGISTER, data);
  }

  /**
   * --- client api ---
   * Register a new client (Organisation)
   */
  static async clientRegister(data: ClientRegisterPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CLIENT.REGISTER, data);
  }

  /**
   * Login user (Contractor or Client)
   */
  static async login(data: LoginPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.LOGIN, data);
  }

  /**
   * Verify OTP 
   */
  static async verifyOtp(data: VerifyOtpPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  }

  /**
   * --- client api ---
   * Verify OTP during registration
   */
  static async registerVerifyOtp(data: VerifyOtpPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CLIENT.REGISTER_VERIFY_OTP, data);
  }

  /**
   * --- client api ---
   * Reset password using OTP
   */
  static async resetPassword(data: ResetPasswordPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  static async logout(): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<ApiResponse> {
    return ApiService.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
  }

  /**
   * Update Notification Settings
   */
  static async updateNotificationSettings(enabled: boolean): Promise<ApiResponse> {
    const token = getToken();
    const payload: any = { notificationEnabled: enabled };
   
    
    return ApiService.put(API_ENDPOINTS.AUTH.UPDATE_NOTIFICATION_SETTINGS, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Update FCM Token
   */
  static async updateFcmToken(deviceToken: string, deviceType: string, deviceId: string): Promise<ApiResponse> {
    const token = getToken();
    const payload = { deviceToken, deviceType, deviceId };
    
    return ApiService.patch(API_ENDPOINTS.AUTH.FCM_TOKEN, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Get Received Ratings
   */
  static async getReceivedRatings(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.AUTH.GET_RECEIVED_RATINGS, { page, limit }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Get Submitted Ratings
   */
  static async getSubmittedRatings(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.AUTH.GET_SUBMITTED_RATINGS, { page, limit }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async addIdentity(data: IdentityPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.IDENTITY, data);
  }

  /**
   * Step after Identity: Add Profile details
   */
  static async addProfile(data: ProfilePayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.PROFILE, data);
  }

  /**
   * Resend OTP (Unified for both roles)
   */
  static async resendOtp(data: { 
    email?: string; 
    mobile?: string;
    countryCode?: number;
    type: 'forgotPassword' | 'client' | 'contractor' | 'email-update' | 'mobile-update';
    role: 'client' | 'contractor';
  }): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.RESEND_OTP, data);
  }

  /**
   * Initiate Email Update (triggers OTP)
   */
  static async updateEmail(email: string): Promise<ApiResponse<{ otpId: string, expiresIn?: number }>> {
    const token = getToken();
    return ApiService.patch(API_ENDPOINTS.AUTH.EMAIL_UPDATE, { email, type: 'email-update' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Verify Email Update
   */
  static async verifyEmailUpdate(data: { email: string; otpId: string; otp: string; type: 'email-update' }): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_UPDATE, { ...data, type: 'email-update' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Initiate Mobile Update (triggers OTP)
   */
  static async updateMobile(mobile: string, countryCode: number = 1): Promise<ApiResponse<{ otpId: string }>> {
    const token = getToken();
    const prefixRegex = new RegExp(`^\\+${countryCode}\\s?`);
    const cleanMobile = mobile.replace(prefixRegex, '').replace(/\s+/g, '');
    return ApiService.patch(API_ENDPOINTS.AUTH.MOBILE_UPDATE, { mobile: cleanMobile, countryCode, type: 'mobile-update' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Verify Mobile Update
   */
  static async verifyMobileUpdate(data: { mobile: string; countryCode: string; otpId: string; otp: string; type: 'mobile-update' }): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.AUTH.VERIFY_MOBILE_UPDATE, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }


  /**
   * --- client api ---
   * Initiate forgot password flow
   */
  static async forgotPassword(data: { email: string; role: 'client' | 'contractor' }): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  /**
   * Submit Contractor Documents (Step 4)
   */
  static async addDocuments(data: {
    resumeUrl?: string;
    portfolioUrl: string;
    professionalLicenseUrl?: string;
    certificate?: { certificateId: string; type: string; url: string } | null;
    agreementUrl?: string;
  }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.DOCUMENTS, data);
  }

  /**
   * Final Step: Add Banking details
   */
  static async addBank(data: BankPayload): Promise<ApiResponse> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.BANK, data);
  }

  /**
   * --- contractor api ---
   * Get Work Categories for Profile Setup
   */
  static async getWorkCategories(): Promise<ApiResponse<{ id: string, name: string }[]>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.WORK_CATEGORIES);
  }

  /**
   * Fetch all Canadian provinces with pagination.
   * @param page Current page number (default: 1)
   * @param limit Items per page (default: 25)
   */
  static async getProvinces(
    page: number = 1,
    limit: number = 100,
  ): Promise<ApiResponse<ProvincesResponse>> {
    return ApiService.get(
      `${API_ENDPOINTS.DCBANK.Province}?page=${page}&limit=${limit}`,
    );
  }

  /**
   * Fetch a list of countries from the API with pagination and optional search.
   * @param page Current page number (default: 1)
   * @param limit Items per page (default: 25)
   * @param search Optional search query
   */
  static async getCountries(
    page: number = 1,
    limit: number = 25,
    search: string = ''
  ): Promise<ApiResponse<CountriesResponse>> {
    return ApiService.get(
      `${API_ENDPOINTS.DCBANK.Country}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    );
  }

  /**
   * Fetch a list of cities for a specific province with pagination and optional search query.
   * @param provinceId The ID of the province to fetch cities for
   * @param page Current page number (default: 1)
   * @param limit Items per page (default: 25)
   */
  static async getCities(
    provinceId: string,
    page: number = 1,
    limit: number = 25,
    search: string = ''
  ): Promise<ApiResponse<any[] | null>> {
    return ApiService.get(
      `${API_ENDPOINTS.DCBANK.City}?provinceId=${provinceId}&page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`,
    );
  }



  /**
   * Get List of Available Certificates
   */
  static async getCertificates(): Promise<ApiResponse<{ id: string, name: string }[]>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_CERTIFICATES);
  }

  /**
   * --- client api ---
   * Get Presigned URL for Client Organization Setup Document
   */
  static async getClientPresignedUrl(data: {
    fileSize: number,
    contentType: string,
    folder: string
  }): Promise<ApiResponse<{ uploadUrl: string, key: string, fileUrl: string }>> {
    return ApiService.getPresignedUrl(data.fileSize, data.contentType, data.folder);
  }


  /**
   * --- client api ---
   * Setup Client Organization details
   */
  static async setupOrganisation(data: {
    companyAddress: string,
    city: string,
    province: string,
    country: string,
    postalCode: string,
    businessCategories: string[],
    businessRegistrationDocument: {
      documentUrl: string
    }
  }): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.SETUP_ORGANISATION, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }


  /**
   * --- client api ---
   * Add Bank Payment Method
   */
  static async addClientBank(data: {
    bankName: string,
    branchName: string,
    accountHolderName: string,
    bankAccountNumber: string,
    bankRoutingNumber: string,
  }): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.ADD_BANK, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Get Business Categories for Organization Setup
   */
  static async getBusinessCategories(): Promise<ApiResponse<{ id: string, name: string }[]>> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.CLIENT.BUSINESS_CATEGORIES, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * --- client api ---
   * Get Client Profile details
   */
  static async getClientProfile(): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.CLIENT.PROFILE_INFO, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Set transaction PIN for Client
   * Accepts RSA-encrypted PIN payload
   */
  static async setTransactionPin(data: { transactionPin: string }): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.SET_TRANSACTION_PIN, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Verify transaction PIN for Client
   * Accepts RSA-encrypted PIN payload
   */
  static async verifyTransactionPin(data: { transactionPin: string }): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.VERIFY_TRANSACTION_PIN, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Change transaction PIN for Client
   * Accepts currentPin and newPin as RSA-encrypted strings
   */
  static async changeTransactionPin(data: { currentPin: string; newPin: string }): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.CHANGE_TRANSACTION_PIN, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- PIN api ---
   * Step 1: Send OTP to reset/forgot transaction PIN
   */
  static async forgotPinSendOtp(data: { email: string; channel?: 'email' | 'sms' }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_SEND_OTP, {
      channel: 'email',
      ...data,
    });
  }

  /**
   * --- PIN api ---
   * Resend OTP for reset/forgot transaction PIN
   * POST /api/v1/pin/forgot-pin/resend-otp
   */
  static async forgotPinResendOtp(data: { email: string; channel?: 'email' | 'sms' }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_RESEND_OTP, {
      channel: 'email',
      ...data,
    });
  }

  /**
   * --- PIN api ---
   * Step 2: Verify OTP for reset/forgot transaction PIN
   */
  static async forgotPinVerifyOtp(data: { otp: string; otpId: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_VERIFY_OTP, data);
  }

  /**
   * --- PIN api ---
   * Step 3: Reset transaction PIN with pinResetToken and new PIN (RSA encrypted)
   */
  static async forgotPinReset(data: { pinResetToken: string; newPin: string; newTransactionPin?: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_RESET, {
      ...data,
      newTransactionPin: data.newTransactionPin || data.newPin,
    });
  }

  /**
   * --- client api ---
   * Get Client Home Dashboard Data
   */
  static async getClientHome(): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.CLIENT.GET_HOME, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Get Client Payment Methods
   */
  static async getClientPaymentMethods(): Promise<ApiResponse<any>> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.CLIENT.GET_PAYMENT_METHODS, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * --- client api ---
   * Get List of Draft Jobs
   */
  static async getDraftJobs(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<any>> {
    const token = getToken();
    const params: any = { page, limit };
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return ApiService.get(API_ENDPOINTS.CLIENT.LIST_DRAFT_JOBS, params, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordPayload): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Add client payment card
   */
  static async addClientCard(data: AddCardPayload): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.post(API_ENDPOINTS.CLIENT.ADD_CARD, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }


  /**
   * Delete client payment method
   */
  static async deleteClientPaymentMethod(paymentMethodId: string): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.delete(`${API_ENDPOINTS.CLIENT.DELETE_PAYMENT_METHOD}/${paymentMethodId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Get client profile info
   */
  static async getClientProfileInfo(): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.get(API_ENDPOINTS.CLIENT.PROFILE_INFO, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Update client profile info
   */
  static async updateClientProfile(data: UpdateClientProfilePayload): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.patch(API_ENDPOINTS.CLIENT.UPDATE_PROFILE, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Update profile image
   */
  static async updateProfileImage(profileImage: string): Promise<ApiResponse> {
    const token = getToken();
    return ApiService.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE_IMAGE, { profileImage }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async deleteDraftJob(jobId: string): Promise<ApiResponse> {
    const url = API_ENDPOINTS.JOBS.DELETE_DRAFT_JOB(jobId);
    return ApiService.delete(url);
  }

  /**
   * Upload file to S3 wrapper
   */

  static async uploadToS3(url: string, localUri: string, fileType: string): Promise<void> {
    return ApiService.uploadToS3(url, localUri, fileType);
  }

  /**
   * Get global system settings
   */
  static async getSystemSettings(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.UTIL.SETTINGS);
  }

  /**
   * Get Country Codes
   */
  static async getCountryCodes(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.UTIL.COUNTRY_CODES);
  }
}

export default AuthService;
