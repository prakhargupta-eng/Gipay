import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

class JobService {
  /**
   * Create a new job
   */
  static async createJob(data: any): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.JOBS.CREATE, data);
  }

  /**
   * List draft jobs
   */
  static async listDraftJobs(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.JOBS.LIST_DRAFT_JOBS);
  }

  /**
   * Get list of certificates
   */
  static async getCertificates(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_CERTIFICATES);
  }

  /**
   * Get list of contractors for invitation with search and filters
   */
  static async getContractorsForInvitation(

    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
    minRating?: number,
    certificationIds?: string,
    jobId?: string,
  ): Promise<ApiResponse<any>> {
    const params: any = { page, limit };
    if (jobId) params.jobId = jobId;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (minRating) params.minRating = minRating;
    if (certificationIds) params.certificationIds = certificationIds;

    return ApiService.get(API_ENDPOINTS.JOBS.GET_CONTRACTORS, params);
  }

  /**
   * Send invitations to selected contractors
   */
  static async sendInvitations(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.INVITE_CONTRACTORS(jobId);
    return ApiService.post(url, payload);
  }

  /**
   * Get contractor details by ID
   */
  static async getContractorDetail(contractorId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CONTRACTOR.GET_CONTRACTOR_DETAIL(contractorId);
    return ApiService.get(url);
  }

  /**
   * Get list of upcoming jobs for the client
   */
  static async getUpcomingJobs(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ApiResponse<any>> {
    const params: any = { page, limit };
    if (search) params.search = search;

    return ApiService.get(API_ENDPOINTS.JOBS.UPCOMING, params);
  }

  /**
   * Get list of active jobs for the client
   */
  static async getActiveJobs(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<ApiResponse<any>> {
    const params: any = { page, limit };
    if (search) params.search = search;

    return ApiService.get(API_ENDPOINTS.JOBS.active, params);
  }

  /**
   * Get list of completed jobs for the client
   */
  static async getCompletedJobs(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ApiResponse<any>> {
    const params: any = { page, limit };
    if (search) params.search = search;

    return ApiService.get(API_ENDPOINTS.JOBS.completed, params);
  }

  /**
   * Get list of jobs eligible for inviting contractors (with selectAll and filters support)
   */
  static async getInvitationEligibleJobs(
    payload: any,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any>> {
    const body = {
      ...payload,
      page,
      limit
    };
    return ApiService.post(API_ENDPOINTS.JOBS.INVITATION_ELIGIBLE, body);
  }

  /**
   * Get invitation summary (counts for invited, eligible, etc.)
   */
  static async getInvitationSummary(payload: any): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.JOBS.INVITATION_SUMMARY, payload);
  }

  /**
   * Get list of jobs for contractor (active, upcoming, completed)
   */
  static async getContractorMyJobs(params: {
    tab: 'active' | 'upcoming' | 'completed';
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    lat?: number;
    lng?: number;
  }): Promise<ApiResponse<any>> {
    const apiParams: any = {
      tab: params.tab,
      ...(params.page != null && { page: params.page }),
      ...(params.limit != null && { limit: params.limit }),
    };
    if (params.search) apiParams.search = params.search;
    if (params.startDate) apiParams.startDate = params.startDate;
    if (params.endDate) apiParams.endDate = params.endDate;
    if (params.lat != null) apiParams.lat = params.lat;
    if (params.lng != null) apiParams.lng = params.lng;
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_MY_JOBS, apiParams);
  }

  /**
   * Send invitations for jobs/contractors (handles single/multiple)
   */
  static async inviteContractorToJobs(payload: any): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.JOBS.INVITE_CONTRACTOR, payload);
  }

  /**
   * Publish a draft job
   */
  static async publishJob(draftId: string, payload?: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.PUBLISH(draftId);
    return ApiService.patch(url, payload || {});
  }

  /**
   * Get job details by ID
   */
  static async getJobDetails(jobId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.GET_JOB_DETAIL(jobId);
    return ApiService.get(url);
  }

  /**
   * Get attendance details for a contractor on a job
   */
  static async getAttendanceDetails(jobId: string, contractorId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.GET_ATTENDANCE(jobId, contractorId);
    return ApiService.get(url);
  }

  /**
   * Get payment details for a contractor on a job
   */
  static async getPaymentDetails(jobId: string, contractorId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.GET_PAYMENTS(jobId, contractorId);
    return ApiService.get(url);
  }

  /**
   * Raise a dispute for a job
   */
  static async raiseDispute(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.RAISE_DISPUTE(jobId);
    return ApiService.post(url, payload);
  }

  /**
   * Raise a dispute for a job from contractor side
   */
  static async raiseContractorDispute(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CONTRACTOR.RAISE_DISPUTE(jobId);
    return ApiService.post(url, payload);
  }

  static async manualClockIn(jobId: string, payload: { contractorId: string; clockInTime: string }): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.MANUAL_CLOCK_IN(jobId);
    return ApiService.post(url, payload);
  }

  static async getClockInEligibleContractors(jobId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.GET_CLOCK_IN_ELIGIBLE_CONTRACTORS(jobId);
    return ApiService.get(url);
  }

  /**
   * Cancel a job
   */
  static async cancelJob(jobId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.CANCEL(jobId);
    return ApiService.patch(url, {});
  }

  /**
   * Submit a rating for a job
   */
  static async submitRating(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.RATE(jobId);
    return ApiService.post(url, payload);
  }

  /**
   * Edit an existing job
   */
  static async editJob(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.EDIT(jobId);
    return ApiService.patch(url, payload);
  }

  static async getDisputeEligibleContractors(jobId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.GET_DISPUTE_ELIGIBLE_CONTRACTORS(jobId);
    return ApiService.get(url);
  }

  /**
   * Delete a draft job
   */
  static async deleteDraftJob(jobId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.JOBS.DELETE_DRAFT_JOB(jobId);
    return ApiService.delete(url);
  }

  /**
   * Get pending job matches
   */
  static async getPendingMatches(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    const params = { page, limit };
    return ApiService.get(API_ENDPOINTS.CLIENT.MATCHES_PENDING, params);
  }

  /**
   * Get confirmed job matches
   */
  static async getConfirmedMatches(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    const params = { page, limit };
    return ApiService.get(API_ENDPOINTS.CLIENT.MATCHES_CONFIRMED, params);
  }

  /**
   * Get match details by application ID
   */
  static async getMatchDetails(applicationId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.MATCH_DETAILS(applicationId);
    return ApiService.get(url);
  }

  /**
   * Get negotiation details for a match (Popup Data)
   */
  static async getMatchNegotiationDetails(applicationId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.MATCH_NEGOTIATION_DETAILS(applicationId);
    return ApiService.get(url);
  }

  /**
   * Send a counter offer for a match application
   */
  static async sendMatchCounterOffer(applicationId: string, data: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.MATCH_COUNTER_OFFER(applicationId);
    return ApiService.patch(url, data);
  }

  /**
   * Accept a match application
   */
  static async acceptMatch(applicationId: string, data?: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.MATCH_ACCEPT(applicationId);
    return ApiService.patch(url, data);
  }

  /**
   * Reject a match application
   */
  static async rejectMatch(applicationId: string, data?: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.MATCH_REJECT(applicationId);
    return ApiService.patch(url, data);
  }

  /**
   * Submit a rating for a client from the contractor
   */
  static async rateClient(jobId: string, payload: any): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CONTRACTOR.RATE_JOB(jobId);
    return ApiService.post(url, payload);
  }

  /**
   * Get jobs awaiting approval for the client
   */
  static async getJobsAwaitingApproval(page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<any>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    return ApiService.get(API_ENDPOINTS.CLIENT.AWAITING_APPROVAL, params);
  }

  /**
   * Get job awaiting approval details for a specific job and contractor
   */
  static async getAwaitingApprovalJobDetails(jobId: string, contractorId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.AWAITING_APPROVAL_DETAILS(jobId, contractorId);
    return ApiService.get(url);
  }

  /**
   * Adjust hours for a job awaiting approval
   */
  static async adjustAwaitingApprovalHours(
    jobId: string,
    contractorId: string,
    attendanceId: string,
    payload: { clientApprovedHours: number } | any
  ): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.AWAITING_APPROVAL_ADJUST_HOURS(jobId, contractorId, attendanceId);
    return ApiService.patch(url, payload);
  }

  /**
   * Mark a job awaiting approval as complete
   */
  static async markAwaitingApprovalComplete(jobId: string, contractorId: string, attendanceId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CLIENT.AWAITING_APPROVAL_MARK_COMPLETE(jobId, contractorId, attendanceId);
    return ApiService.patch(url, {});
  }
}

export default JobService;
