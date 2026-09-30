import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

//Model

export interface FinancialInstitution {
  id: string;
  financialInstitutionId: number;
  description: string;
  bankNumber: number;
  status: string;
}

export interface Branch {
  id: string;
  branchId: number;
  financialInstitutionId: string;
  routingNumber: string;
  transitNumber: number;
  description: string;
  stateCode: string;
  cityName: string;
  address1: string;
  address2: string;
  zipCode: string;
  status: string;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface FinancialInstitutionsResult {
  financialInstitutions: FinancialInstitution[];
  pagination: Pagination;
}

export interface BranchesResult {
  branches: Branch[];
  pagination: Pagination;
}

export interface FinancialInstitutionsResponse {
  success: boolean;
  message: string;
  results: FinancialInstitutionsResult;
}

export interface BranchesResponse {
  success: boolean;
  message: string;
  results: BranchesResult;
}

export interface SecurityQuestion {
  _id: string;
  securityQuestionId: number;
  securityQuestion: string;
  securityQuestionAnswer: string;
  status: string;
}

export interface SecurityQuestionsResult {
  questions: SecurityQuestion[];
}

export interface SecurityQuestionsResponse {
  success: boolean;
  message: string;
  results: SecurityQuestionsResult;
}
//==================== end ====================






class PaymentService {
  /**
   * Get list of payment methods (cards and banks)
   */
  static async getPaymentMethods(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    const params = { page, limit };
    return ApiService.get(API_ENDPOINTS.CLIENT.GET_PAYMENT_METHODS, params);
  }

  /**
   * Get wallet dashboard details
   */
  static async getWalletDashboard(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CLIENT.WALLET_DASHBOARD);
  }

  /**
   * Get contractor wallet dashboard details
   */
  static async getContractorWalletDashboard(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.WALLET_DASHBOARD);
  }

  /**
   * Get contractor wallet transactions history
   */
  static async getContractorTransactions(params?: any): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.TRANSACTIONS, params);
  }

  /**
   * Get contractor earnings history
   */
  static async getContractorEarnings(params?: any): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.EARNINGS, params);
  }

  /**
   * Get contractor bank accounts list
   */
  static async getContractorBanks(): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CONTRACTOR.GET_BANKS);
  }

  /**
   * Withdraw contractor earnings to bank account
   */
  static async withdrawContractor(data: {
    amount: number;
    bankAccountId: string;
    method: 'standard' | 'instant';
    securityQuestionId?: string;
    phoneNumber?: string;
    phoneCountryCode?: string | number;
  }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CONTRACTOR.WITHDRAW, data);
  }

  /**
   * Add money to wallet
   */
  static async addMoney(data: { amount: number; paymentMethodId: string }): Promise<ApiResponse<any>> {
    return ApiService.post(API_ENDPOINTS.CLIENT.ADD_MONEY, data);
  }

  /**
   * Get wallet transactions history
   */
  static async getWalletTransactions(params: any): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CLIENT.GET_TRANSACTIONS, params);
  }

  /**
   * Get payment history (invoices/payments)
   */
  static async getPaymentHistory(params: any): Promise<ApiResponse<any>> {
    return ApiService.get(API_ENDPOINTS.CLIENT.PAYMENTS, params);
  }

  /**
   * Get payment details by transaction ID
   */
  static async getPaymentDetails(transactionId: string): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.CLIENT.PAYMENTS}/${transactionId}`;
    return ApiService.get(url);
  }

  /**
   * Get wallet transaction details by transaction ID
   */
  static async getWalletTransactionDetails(transactionId: string): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.CLIENT.GET_TRANSACTIONS}/${transactionId}`;
    return ApiService.get(url);
  }

  /**
   * Get contractor transaction details by transaction ID
   */
  static async getContractorTransactionDetails(transactionId: string): Promise<ApiResponse<any>> {
    const url = API_ENDPOINTS.CONTRACTOR.GET_TRANSACTION_DETAILS(transactionId);
    return ApiService.get(url);
  }

  /**
   * Get the full URL for downloading an invoice
   */
  static getInvoiceDownloadUrl(transactionId: string): string {
    const { getBaseUrl } = require('./apiConfig');
    return `${getBaseUrl()}${API_ENDPOINTS.CLIENT.DOWNLOAD_INVOICE(transactionId)}`;
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(id: string): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.CLIENT.DELETE_PAYMENT_METHOD}/${id}`;
    return ApiService.delete(url);
  }

  /**
   * Update a payment card
   */
  static async updateClientCard(paymentMethodId: string, data: any): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.CLIENT.GET_PAYMENT_METHODS}/${paymentMethodId}/card`;
    return ApiService.patch(url, data);
  }

  /**
   * Update a bank account
   */
  static async updateClientBank(paymentMethodId: string, data: any): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.CLIENT.GET_PAYMENT_METHODS}/${paymentMethodId}/bank`;
    return ApiService.patch(url, data);
  }

  /**
   * get bank details
   */
  static async getFinancialInstitutions(
    page: number = 1,
    limit: number = 100,
  ): Promise<ApiResponse<FinancialInstitutionsResponse>> {
    const url = `${API_ENDPOINTS.DCBANK.FINANCIAL_INSTITUTIONS}?page=${page}&limit=${limit}`;
    return ApiService.get(url);
  }

  static async getBranches(
    financialInstitutionId: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.DCBANK.BRANCHES}?financialInstitutionId=${financialInstitutionId}&page=${page}&limit=${limit}`;
    return ApiService.get(url);
  }

  /**
   * Get dcbank etransfer security questions
   */
  static async getSecurityQuestions(): Promise<ApiResponse<SecurityQuestionsResult>> {
    return ApiService.get(API_ENDPOINTS.DCBANK.SECURITY_QUESTIONS);
  }
}

export default PaymentService;
