// src/config/disputeService.ts

import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export interface DisputeEvidence {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface Dispute {
  _id: string;
  subject: string;
  description: string;
  evidence: DisputeEvidence[];
  status: string;
  displayStatus?: string;
  disputeId: string;
  createdAt: string;
  updatedAt?: string;
  job?: {
    _id: string;
    clientName: string;
    title: string;
    organizationName: string;
    location: string;
    hourlyRate: number;
    startDate: string;
    endDate: string;
    jobId: string;
    startTime?: string;
    endTime?: string;
  };
  // Fields for card display mapping if needed
  title?: string;
  company?: string;
  dateRange?: string;
  time?: string;
  otherParty?: {
    _id: string;
    fullName: string;
    email?: string;
    role?: string;
    organizationName?: string;
    rating?: number;
  };
  initiatedBy?: {
    _id: string;
    fullName: string;
    email?: string;
    role?: string;
  };
  initiatedFor?: {
    _id: string;
    fullName: string;
    email?: string;
    role?: string;
  };
}

export interface DisputeDetailsResponse extends Dispute {
  jobId: {
    _id: string;
    clientName: string;
    title: string;
    description: string;
    organizationName: string;
    location: string;
    hourlyRate: number;
    startDate: string;
    endDate: string;
    jobId: string;
    // Optional fields that might be missing in some responses
    startTime?: string;
    endTime?: string;
    requiredCertifications?: string[];
    requiredContractors?: number;
  };
  initiatedBy: {
    _id: string;
    email: string;
    role: string;
    fullName: string;
  };
  initiatedFor: {
    _id: string;
    email: string;
    role: string;
    fullName: string;
  };
  otherParty: {
    _id: string;
    email: string;
    role: string;
    fullName: string;
    organizationName: string;
    rating?: number;
  };
  rating?: number;
  resolution?: string;
  resolvedAmountClient?: number;
  resolvedAmountContractor?: number;
}

export interface PaginatedDisputes {
  data: Dispute[];
  pagination: {
    page: number;
    pages: number;
    total?: number;
    limit?: number;
  };
}


export interface DisputeCategory {
  _id: string;
  name: string;
}

class DisputeService {
  static async getDisputes(params: {
    tab: 'by' | 'for';
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<Dispute[]>> {
    return ApiService.get<Dispute[]>(API_ENDPOINTS.CONTRACTOR.DISPUTES, params);
  }

  static async getContractorDisputes(params: {
    tab: 'by' | 'for';
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<Dispute[]>> {
    return ApiService.get<Dispute[]>(API_ENDPOINTS.CONTRACTOR.DISPUTES, params);
  }

  static async getDisputeDetails(id: string): Promise<ApiResponse<DisputeDetailsResponse>> {
    return ApiService.get<DisputeDetailsResponse>(API_ENDPOINTS.CONTRACTOR.DISPUTE_DETAILS(id));
  }

  static async getContractorDisputeDetails(id: string): Promise<ApiResponse<DisputeDetailsResponse>> {
    return ApiService.get<DisputeDetailsResponse>(API_ENDPOINTS.CONTRACTOR.DISPUTE_DETAILS(id));
  }

  // client dispute app

  static async getClientDisputes(params: {
    tab: 'by' | 'for';
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<PaginatedDisputes>> {
    return ApiService.get<PaginatedDisputes>(API_ENDPOINTS.CLIENT.DISPUTES, params);
  }

  static async getDisputeClientDetails(id: string): Promise<ApiResponse<DisputeDetailsResponse>> {
    return ApiService.get<DisputeDetailsResponse>(API_ENDPOINTS.CLIENT.DISPUTE_DETAILS(id));
  }

  static async getDisputeCategories(): Promise<ApiResponse<DisputeCategory[]>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.DISPUTE_CATEGORIES);
  }
}

export default DisputeService;

