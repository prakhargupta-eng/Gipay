// src/config/apiConfig.ts

import Config from 'react-native-config';

export enum Environment {
  staging = 'staging',
  DEV = 'DEV',
  QA = 'QA',
  UAT = 'UAT',
  PROD = 'PROD',
}

// 🔁 Change this to switch environment
export const CURRENT_ENV: Environment = Environment.QA;

// 🌍 Base URLs

const BASE_URLS = {
  [Environment.DEV]: Config.DEV_API_URL,
  [Environment.staging]: Config.STAGING_API_URL,
  [Environment.QA]: Config.QA_API_URL,
  [Environment.UAT]: Config.UAT_API_URL,
  [Environment.PROD]: Config.PROD_API_URL,
};

// ✅ Get Base URL
export const getBaseUrl = (): string => BASE_URLS[CURRENT_ENV];

// ⚡ Get Socket Server URL
export const getSocketUrl = (): string => {
  const baseUrl = getBaseUrl();
  return baseUrl ? baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') : '';
};

// 📌 API Endpoints (ONLY paths here)
export const API_ENDPOINTS = {
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read',
    MARK_READ: (id: string) => `/notifications/${id}/mark-read`,
  },
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    DELETE_ACCOUNT: '/profile',
    UPDATE_NOTIFICATION_SETTINGS: '/profile/notification-settings',
    GET_RECEIVED_RATINGS: '/profile/ratings/received',
    GET_SUBMITTED_RATINGS: '/profile/ratings/submitted',
    REGISTER_VERIFY_OTP: '/auth/register/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    EMAIL_UPDATE: '/auth/email-update',
    VERIFY_EMAIL_UPDATE: '/auth/verify-email-update',
    CHANGE_PASSWORD: '/profile/change-password',
    UPDATE_PROFILE_IMAGE: '/profile/image',
    MOBILE_UPDATE: '/auth/mobile-update',
    VERIFY_MOBILE_UPDATE: '/auth/verify-mobile-update',
    FCM_TOKEN: '/auth/fcm-token',
  },

  PIN: {
    FORGOT_PIN_SEND_OTP: '/pin/forgot-pin/send-otp',
    FORGOT_PIN_RESEND_OTP: '/pin/forgot-pin/resend-otp',
    FORGOT_PIN_VERIFY_OTP: '/pin/forgot-pin/verify-otp',
    FORGOT_PIN_RESET: '/pin/forgot-pin/reset',
  },


  CLIENT: {
    GET_HOME: '/client/home',
    REGISTER: '/auth/client/register',
    REGISTER_VERIFY_OTP: '/auth/verify-otp',
    BUSINESS_CATEGORIES: '/auth/client/setup-organisation/business-categories',
    SETUP_ORGANISATION: '/auth/client/setup-organisation',

    ADD_CARD: '/client/payment-methods/card',
    ADD_BANK: '/client/payment-methods/bank',
    AWAITING_APPROVAL: '/client/jobs/awaiting-approval',
    AWAITING_APPROVAL_DETAILS: (jobId: string, contractorId: string) => `/client/jobs/awaiting-approval/${jobId}/${contractorId}`,
    AWAITING_APPROVAL_ADJUST_HOURS: (jobId: string, contractorId: string ,attendanceId: string) => `/client/jobs/awaiting-approval/${jobId}/${contractorId}/${attendanceId}/adjust-hours`,
    AWAITING_APPROVAL_MARK_COMPLETE: (jobId: string, contractorId: string ,attendanceId: string) => `/client/jobs/awaiting-approval/${jobId}/${contractorId}/${attendanceId}/mark-complete`,
    GET_PAYMENT_METHODS: '/client/payment-methods',
    PROFILE_INFO: '/client/profile-info',
    UPDATE_PROFILE: '/client/profile-info/update',
    WALLET_DASHBOARD: '/wallet/dashboard',
    ADD_MONEY: '/wallet/add-money',
    GET_TRANSACTIONS: '/wallet/transactions',
    SET_TRANSACTION_PIN: '/client/set-pin',
    CHANGE_TRANSACTION_PIN: '/client/change-pin',
    VERIFY_TRANSACTION_PIN: '/client/verify-pin',
    //payments 
    PAYMENTS: '/client/payments',
    DOWNLOAD_INVOICE: (transactionId: string) => `/client/payments/${transactionId}/invoice`,

    LIST_DRAFT_JOBS: '/client/jobs/drafts',
    DELETE_PAYMENT_METHOD: '/client/payment-methods',
    DISPUTES: '/client/disputes',
    DISPUTE_CATEGORIES: '/dispute-categories',
    DISPUTE_DETAILS: (id: string) => `/client/disputes/${id}`,
    JOB_INVITES: '/client/jobs/invites',
    JOB_INVITE_DETAILS: (inviteId: string) => `/client/jobs/invites/${inviteId}/detail`,
    MATCHES_PENDING: '/client/matches/pending',
    MATCHES_CONFIRMED: '/client/matches/confirmed',
    MATCH_DETAILS: (applicationId: string) => `/client/matches/${applicationId}`,
    MATCH_NEGOTIATION_DETAILS: (applicationId: string) => `/client/matches/${applicationId}/negotiation`,
    MATCH_COUNTER_OFFER: (applicationId: string) => `/client/matches/${applicationId}/counter-offer`,
    MATCH_ACCEPT: (applicationId: string) => `/client/matches/${applicationId}/accept`,
    MATCH_REJECT: (applicationId: string) => `/client/matches/${applicationId}/reject`,
  },
  CONTRACTOR: {
    REGISTER: '/contractor/register',
    WORK_CATEGORIES: '/contractor/work-categories',
    IDENTITY: '/contractor/identity',
    PROFILE: '/contractor/profile',
    DOCUMENTS: '/contractor/documents',
    BANK: '/contractor/bank',
    GET_CERTIFICATES: '/contractor/get-certificates',
    CERTIFICATES: '/contractor/certificates',
    PROFILE_INFO: '/contractor/profile-info',
    UPDATE_PROFILE: '/contractor/profile-info/update',
    BANK_INFO: '/contractor/bank-info',
    ADD_BANK: '/contractor/bank-info/add-bank',
    UPDATE_BANK: '/contractor/bank-info/update-bank',
    DELETE_BANK: '/contractor/bank-info',
    HOME: '/contractor/home',
    // match tap api 
    MATCHES_PENDING: '/contractor/matches/pending',
    MATCHES_CONFIRMED: '/contractor/matches/confirmed',
    MATCH_JOB_DETAIL: (applicationId: string) => `/contractor/matches/${applicationId}/job-detail`,
    ACCEPT_MATCH: (inviteId: string) => `/contractor/matches/${inviteId}/accept`,
    REJECT_MATCH: (applicationId: string) => `/contractor/matches/${applicationId}/reject`,


    DISCOVER_JOBS: '/contractor/jobs/discover',
    GET_CONTRACTOR_DETAIL: (id: string) => `/client/jobs/contractors/${id}`,

    GET_NEGOTIATION: (inviteId: string) => `/contractor/job-invites/${inviteId}/negotiation`,
    applyJob: (invitationId: string) => `/contractor/jobs/${invitationId}/apply`,
    RESPOND_INVITATION: (invitationId: string) => `/contractor/jobs/invites/${invitationId}/respond`,
    GET_JOB_DETAILS: (id: string) => `/contractor/jobs/${id}`,
    JOB_INVITATIONS: '/contractor/jobs/invitations',
    //Job propose
    JOB_PROPOSE: (invitationId: string) => `/contractor/jobs/invites/${invitationId}/propose`,

    // disputes
    DISPUTES: '/contractor/disputes',
    DISPUTE_CATEGORIES: '/dispute-categories',
    DISPUTE_DETAILS: (id: string) => `/contractor/disputes/${id}`,
    GET_MY_JOBS: '/contractor/jobs/my-jobs',
    PAYMENT_DETAILS: (jobId: string) => `/contractor/jobs/${jobId}/payment-details`,
    ATTENDANCE_DETAILS: (jobId: string) => `/contractor/jobs/${jobId}/attendance-details`,
    CLOCK_IN: (jobId: string) => `/contractor/jobs/${jobId}/clock-in`,
    CLOCK_OUT: (jobId: string) => `/contractor/jobs/${jobId}/clock-out`,
    MANUAL_CLOCK_OUT_REQUESTS: '/contractor/jobs/manual-clock-out-requests',
    MANUAL_CLOCK_OUT: (jobId: string) => `/contractor/jobs/${jobId}/manual-clock-out-request`,
    RATE_JOB: (jobId: string) => `/contractor/jobs/${jobId}/rate`,
    RAISE_DISPUTE: (jobId: string) => `/contractor/jobs/${jobId}/dispute`,
    WALLET_DASHBOARD: '/wallet/contractor/dashboard',
    TRANSACTIONS: '/wallet/contractor/transactions',
    GET_TRANSACTION_DETAILS: (id: string) => `/wallet/contractor/transactions/${id}`,
    EARNINGS: '/wallet/contractor/earnings',
    GET_BANKS: '/wallet/contractor/banks',
    WITHDRAW: '/wallet/contractor/withdraw',
    SET_TRANSACTION_PIN: '/contractor/set-pin',
    CHANGE_TRANSACTION_PIN: '/contractor/change-pin',
    VERIFY_TRANSACTION_PIN: '/contractor/verify-pin',
  },
  JOBS: {
    CREATE: '/client/jobs',

    SEND_INVITATION: '/client/jobs/invites/send',
    GET_CONTRACTORS: '/client/jobs/contractors',
    LIST_DRAFT_JOBS: '/client/jobs/drafts',
    UPCOMING: '/client/jobs/manage/upcoming',
    active: '/client/jobs/manage/active',
    completed: '/client/jobs/manage/completed',
    INVITATION_ELIGIBLE: '/client/jobs/manage/invitation-eligible',
    INVITATION_SUMMARY: '/client/jobs/manage/invitation-summary',
    INVITE_CONTRACTORS: (jobId: string) => `/client/jobs/${jobId}/invite-contractors`,
    INVITE_CONTRACTOR: '/client/jobs/invite-contractor',
    PUBLISH: (draftId: string) => `/client/jobs/${draftId}/publish`,
    GET_JOB_DETAIL: (jobId: string) => `/client/jobs/manage/${jobId}`,
    GET_ATTENDANCE: (jobId: string, contractorId: string) => `/client/jobs/manage/${jobId}/contractors/${contractorId}/attendance`,
    GET_PAYMENTS: (jobId: string, contractorId: string) => `/client/jobs/manage/${jobId}/contractors/${contractorId}/payments`,
    RAISE_DISPUTE: (jobId: string) => `/client/jobs/manage/${jobId}/dispute`,
    CANCEL: (jobId: string) => `/client/jobs/manage/${jobId}/cancel`,
    RATE: (jobId: string) => `/client/jobs/manage/${jobId}/rate`,
    EDIT: (jobId: string) => `/client/jobs/manage/${jobId}/edit`,
    MANUAL_CLOCK_IN: (jobId: string) => `/client/jobs/manage/${jobId}/manual-clock-in`,
    GET_CLOCK_IN_ELIGIBLE_CONTRACTORS: (jobId: string) => `/client/jobs/${jobId}/clock-in-eligible-contractors`,
    GET_DISPUTE_ELIGIBLE_CONTRACTORS: (jobId: string) => `/client/jobs/${jobId}/dispute-eligible-contractors`,
    DELETE_DRAFT_JOB: (jobId: string) => `/client/jobs/${jobId}/draft-job`,
  },
  UTIL: {
    SETTINGS: '/util/settings',
    PRESIGNED_URL: '/util/presigned-url',
    CONTENT: '/pages',
    FAQS: '/faqs',
    COUNTRY_CODES: '/country-codes',
  },
  KYC: {
    GET_ACCESS_TOKEN: '/kyc/sumsub/access-token',
    REFRESH_ACCESS_TOKEN: '/kyc/sumsub/access-token/refresh',
  },
  DCBANK: {
    FINANCIAL_INSTITUTIONS: '/dcbank/financial-institutions',
    BRANCHES: '/dcbank/branches',
    Province: '/provinces',
    Country: '/countries',
    City: '/dcbank//cities',
    SECURITY_QUESTIONS: '/dcbank/etransfer/security-questions',
  },
  CHAT: {
    GET_MESSAGES: (jobOrderId: string) => `/chat/job-orders/${jobOrderId}/messages`,
  },
};