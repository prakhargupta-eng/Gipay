import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export interface BankInfoPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

class ContractorService {
  /**
   * Get Contractor Profile Information
   * @param userId ID of the contractor
   */
  static async getProfileInfo(userId: string): Promise<ApiResponse<any>> {
    return ApiService.get(`${API_ENDPOINTS.CONTRACTOR.PROFILE_INFO}?userId=${userId}`);
  }
  
  /**
   * Get Sumsub KYC Access Token
   * Fetches a new access token for the current user to start identity verification.
   */
  static async getKycAccessToken(): Promise<ApiResponse<{ token: string; userId: string; expiresAt: string; levelName: string }>> {
    return ApiService.post(API_ENDPOINTS.KYC.GET_ACCESS_TOKEN, {});
  }

  /**
   * Refresh Sumsub KYC Access Token
   * Called when an existing token has expired during the verification process.
   */
  static async refreshKycAccessToken(): Promise<ApiResponse<{ token: string; userId: string; expiresAt: string; levelName: string }>> {
    return ApiService.post(API_ENDPOINTS.KYC.REFRESH_ACCESS_TOKEN, {});
  }

  static async getBankInfo(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.BANK_INFO);
  }

  /**
   * Update Contractor Profile Information
   */
  static async updateProfile(data: any): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.UPDATE_PROFILE, data);
  }

  /**
   * Add Bank Information
   * @param data Bank details payload
   */
  static async addBankInfo(data: any): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.ADD_BANK, data);
  }

  /**
   * Update Bank Information
   * @param data Bank details payload including bankId
   */
  static async updateBankInfo(data: any): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.UPDATE_BANK, data);
  }

  /**
   * Get Contractor Certificates
   */
  static async getCertificates(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.CERTIFICATES);
  }

  /**
   * Add a new Certificate
   */
  static async addCertificate(data: { certificateId: string; type: string; url: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.CERTIFICATES, data);
  }

  /**
   * Update an existing Certificate
   */
  static async updateCertificate(id: string, data: { certificateId: string; type: string; url: string }): Promise<ApiResponse<any>> {
    return ApiService.patch(`${API_ENDPOINTS.CONTRACTOR.CERTIFICATES}/${id}`, data);
  }

  /**
   * Delete a Certificate
   */
  static async deleteCertificate(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`${API_ENDPOINTS.CONTRACTOR.CERTIFICATES}/${id}`);
  }

  /**
   * Get Contractor Home Screen Data
   */
  static async getHomeData(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.HOME);
  }

  /**
   * Get Pending Matches
   */
  static async getPendingMatches(page: number, limit: number): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.MATCHES_PENDING, { page, limit });
  }

  /**
   * Get Confirmed Matches
   */
  static async getConfirmedMatches(page: number, limit: number): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.MATCHES_CONFIRMED, { page, limit });
  }

  /**
   * Get Job Details for a specific match
   */
  static async getMatchJobDetail(applicationId: string): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.MATCH_JOB_DETAIL(applicationId));
  }

  /**
   * Accept a match
   */
  static async acceptMatch(inviteId: string): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.ACCEPT_MATCH(inviteId));
  }

  /**
   * Reject a match
   */
  static async rejectMatch(applicationId: string): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.REJECT_MATCH(applicationId));
  }

  /**
   * Get Job Invitations for Contractor
   * @param params { page, limit, search, filter }
   */
  static async getInvitations(params: { 
    page: number; 
    limit: number; 
    search?: string; 
    filter?: string;
    fromDate?: string;
    toDate?: string;
    lat?: number;
    lng?: number;
  }): Promise<ApiResponse<any>> {
    const apiParams: any = {
      page: params.page,
      limit: params.limit,
    };
    if (params.search) apiParams.search = params.search;
    if (params.filter && params.filter !== 'All') apiParams.filter = params.filter;
    if (params.fromDate) apiParams.fromDate = params.fromDate;
    if (params.toDate) apiParams.toDate = params.toDate;
    if (params.lat != null) apiParams.lat = params.lat;
    if (params.lng != null) apiParams.lng = params.lng;

    return ApiService.get(API_ENDPOINTS.CONTRACTOR.JOB_INVITATIONS, apiParams);
  }

  /**
   * Get Specific Job Details
   * @param id Job ID
   */
  static async getJobDetails(id: string): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_JOB_DETAILS(id));
  }

  /**
   * Get Payment Details for Contractor
   * @param jobId Job ID
   */
  static async getPaymentDetails(jobId: string): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.PAYMENT_DETAILS(jobId));
  }

  /**
   * Get Attendance Details for Contractor
   * @param jobId Job ID
   */
  static async getAttendanceDetails(jobId: string): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.ATTENDANCE_DETAILS(jobId));
  }

  /**
   * Discover Jobs for Contractor
   * @param params { filter, limit, page, search }
   */
  static async discoverJobs(params: { 
    filter: string; 
    limit: number; 
    page: number; 
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<any>> {
    const apiParams: any = {
        filter: params.filter,
        limit: params.limit,
        page: params.page,
    };
    
    if (params.search) {
        apiParams.search = params.search;
    }

    if (params.fromDate) apiParams.fromDate = params.fromDate;
    if (params.toDate) apiParams.toDate = params.toDate;

    return ApiService.get(API_ENDPOINTS.CONTRACTOR.DISCOVER_JOBS, apiParams);
  }

  /**
   * Delete Bank Information
   * @param id Bank account / payment method ID
   */
  static async deleteBankInfo(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`${API_ENDPOINTS.CONTRACTOR.DELETE_BANK}/${id}`);
  }

  /**
   * Get Negotiation Details
   */
  static async getNegotiation(inviteId: string): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_NEGOTIATION(inviteId));
  }

  /**
   * Propose a higher rate for a job invitation / Apply for a job
   */
  static async applyJob(invitationId: string, proposedRate?: number): Promise<ApiResponse<any>> {
    const data = proposedRate !== undefined ? { proposedRate } : {};
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.applyJob(invitationId), data);
  }

  static async jobPropose(invitationId: string, proposedRate: number): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.JOB_PROPOSE(invitationId), { proposedRate });
  }

  /**
   * Respond to Job Invitation (Accept/Decline)
   */
  static async respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): Promise<ApiResponse<any>> {
    return ApiService.patch(API_ENDPOINTS.CONTRACTOR.RESPOND_INVITATION(invitationId), { status });
  }

  /**
   * Clock In
   */
  static async clockIn(jobId: string, latitude?: number, longitude?: number): Promise<ApiResponse<any>> {
    const data = latitude && longitude ? { latitude, longitude } : {};
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.CLOCK_IN(jobId), data);
  }

  /**
   * Clock Out
   */
  static async clockOut(jobId: string, latitude?: number, longitude?: number): Promise<ApiResponse<any>> {
    const data = latitude && longitude ? { latitude, longitude } : {};
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.CLOCK_OUT(jobId), data);
  }

  /**
   * Get paginated manual clock-out requests for contractor
   */
  static async getManualClockOutRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams: any = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.status) queryParams.status = params.status;
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.MANUAL_CLOCK_OUT_REQUESTS, queryParams);
  }

  /**
   * Submit manual clock out request for a job
   */
  static async manualClockOut(
    jobId: string,
    data: {
      attendanceId: string;
      requestedClockOutTime: string;
      reason: string;
      clockOutTime?: string;
    }
  ): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.MANUAL_CLOCK_OUT(jobId), data);
  }

  /**
   * Set transaction PIN for Contractor
   * Accepts RSA-encrypted PIN payload
   */
  static async setTransactionPin(data: { transactionPin: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.SET_TRANSACTION_PIN, data);
  }

  /**
   * Verify transaction PIN for Contractor
   * Accepts RSA-encrypted PIN payload
   */
  static async verifyTransactionPin(data: { transactionPin: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.VERIFY_TRANSACTION_PIN, data);
  }

  /**
   * Change transaction PIN for Contractor
   * Accepts currentPin and newPin as RSA-encrypted strings
   */
  static async changeTransactionPin(data: { currentPin: string; newPin: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.CHANGE_TRANSACTION_PIN, data);
  }

  /**
   * Step 1: Send OTP to reset/forgot transaction PIN
   */
  static async forgotPinSendOtp(data: { email: string; channel?: 'email' | 'sms' }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_SEND_OTP, {
      channel: 'email',
      ...data,
    });
  }

  /**
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
   * Step 2: Verify OTP for reset/forgot transaction PIN
   */
  static async forgotPinVerifyOtp(data: { otp: string; otpId: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_VERIFY_OTP, data);
  }

  /**
   * Step 3: Reset transaction PIN with pinResetToken and new PIN (RSA encrypted)
   */
  static async forgotPinReset(data: { pinResetToken: string; newPin: string; newTransactionPin?: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.PIN.FORGOT_PIN_RESET, {
      ...data,
      newTransactionPin: data.newTransactionPin || data.newPin,
    });
  }
}

export default ContractorService;
