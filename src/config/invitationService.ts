import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

/**
 * Send invitations to selected contractors for a specific job
 */
export const sendInvitations = async (jobId: string, payload: any): Promise<ApiResponse<any>> => {
    const url = typeof API_ENDPOINTS.JOBS.INVITE_CONTRACTORS === 'function'
        ? API_ENDPOINTS.JOBS.INVITE_CONTRACTORS(jobId)
        : `${API_ENDPOINTS.JOBS.INVITE_CONTRACTORS}/${jobId}`;

    return ApiService.post(url, payload);
};

/**
 * Invite a specific contractor to multiple jobs
 */
export const inviteContractorToJobs = async (contractorId: string, payload: any): Promise<ApiResponse<any>> => {
    const url = typeof API_ENDPOINTS.JOBS.INVITE_CONTRACTOR === 'function'
        ? (API_ENDPOINTS.JOBS.INVITE_CONTRACTOR as any)(contractorId)
        : `${API_ENDPOINTS.JOBS.INVITE_CONTRACTOR}/${contractorId}`;

    return ApiService.post(url, payload);
};

/**
 * Get job invitations with pagination, search, and status filters client
 */
export const getJobInvites = async (params: {
    status?: string;
    filter?: string;
    page: number;
    limit: number;
    search?: string;
}): Promise<ApiResponse<any>> => {
    return ApiService.get(API_ENDPOINTS.CLIENT.JOB_INVITES, params);
};

/**
 * Get details of a specific job invitation by invitationId client
 */
export const getJobInviteDetails = async (inviteId: string): Promise<ApiResponse<any>> => {
    return ApiService.get(API_ENDPOINTS.CLIENT.JOB_INVITE_DETAILS(inviteId));
};
