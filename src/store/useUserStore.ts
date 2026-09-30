import { create } from 'zustand';
import * as Storage from './storage';

export interface ContractorProfile {
  isPIN?: boolean;
  isPINSet?: boolean;
  keyset?: boolean;
  user: {
    _id: string;
    fullname: string;
    fullName?: string;
    email: string;
    mobile?: string;
    countryCode?: number;
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    profileImageUrl?: string;
    isEmailUpdated?: boolean;
    isMobileUpdated?: boolean;
    isPIN?: boolean;
    isPINSet?: boolean;
  };
  profile: {
    identityVerification?: {
      profileImageUrl?: string;
      address?: {
        street?: string;
        residentialAddress?: string;
        city?: any;
        province?: any;
        country?: any;
        postalCode?: string;
        [key: string]: any;
      } | any;
      [key: string]: any;
    };
    professionalProfile?: {
      workCategory?: string | { id: string; name: string };
      skills?: string[];
      experience?: number;
      bio?: string;
      hourlyRate?: number;
      availabilityDays?: string[];
      portfolioUrl?: string;
    };


    workerEligibility?: {
      citizenshipStatus?: string;
      workPermit?: string;
      visaStatus?: string;
    };
    bankingInformation?: any[];
    [key: string]: any;
  };

  profileImageUrl?: string;
}


export interface ClientProfile {
  user: {
    _id: string;
    email: string;
    fullname: string;
    fullName?: string;
    mobile?: string;
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    profileImageUrl?: string;
    isEmailUpdated?: boolean;
    isMobileUpdated?: boolean;
    isPIN?: boolean;
    isPINSet?: boolean;
  };
  isPIN?: boolean;
  isPINSet?: boolean;
  keyset?: boolean;
  profile: {
    _id: string;
    organizationName: string;
    contactPersonName: string;
    companyAddress?: string;
    businessCategory?: string;
    onboardingCompleted: boolean;
    verificationStatus: string;
    businessRegistrationDocument?: {
      documentUrl: string;
      documentName: string;
      verificationStatus: string;
      rejectionReason: string
    };
    activityOverview?: {
      totalJobPostings: number;
      activeJobPostings: number;
      completedJobs: number;
      totalEscrowFunded: number;
    };
    [key: string]: any;
  };
}

interface UserState {
  profile: ContractorProfile | null;
  clientProfile: ClientProfile | null;
  isPIN?: boolean;
  isPINSet?: boolean;
  hasDismissedPinPrompt: boolean;
  setHasDismissedPinPrompt: (val: boolean) => void;
  setIsPIN: (isPIN: boolean) => void;
  setIsPINSet: (isPINSet: boolean) => void;
  setProfile: (profile: ContractorProfile) => void;
  setClientProfile: (profile: ClientProfile) => void;
  updateClientEmail: (email: string) => void;
  updateContractorEmail: (email: string) => void;
  updateContractorMobile: (mobile: string) => void;
  updateClientMobile: (mobile: string) => void;
  tempFullName: string | null;
  setTempFullName: (name: string | null) => void;
  clearProfile: () => void;
  getVerificationStatus: () => 'approved' | 'pending' | 'rejected' | 'not_uploaded';
  isRestricted: () => boolean;
  getClientVerificationStatus: () => string;
  isClientRestricted: () => boolean;
  clientTabIndex: number;
  setClientTabIndex: (index: number) => void;
  contractorTabIndex: number;
  setContractorTabIndex: (index: number) => void;
  jobsActiveSegment: string;
  setJobsActiveSegment: (segment: string) => void;
  isPinSet: (profileData?: any) => boolean;
  disputeLeaveJobIds: string[];
  addDisputeLeaveJobId: (id: string) => void;
  disputedJobIds: string[];
  addDisputedJobId: (id: string) => void;
}

/**
 * Global helper to check if Transaction PIN is fully configured.
 * Both isPIN and isPINSet must be true.
 * Works seamlessly across Contractor and Client sides, supporting:
 * - Direct profile object (top-level isPIN, user.isPIN, profile.isPIN)
 * - Or fallback to the current active profile / PIN state in useUserStore
 */
export const checkIsPinSet = (profileData?: any): boolean => {
  if (profileData) {
    const isPIN = profileData.isPIN ?? profileData.user?.isPIN ?? profileData.profile?.isPIN;
    const isPINSet = profileData.isPINSet ?? profileData.user?.isPINSet ?? profileData.profile?.isPINSet;
    return isPIN === true && isPINSet === true;
  }
  const state = useUserStore.getState();
  const activeProfile = state.clientProfile || state.profile;
  if (activeProfile) {
    const isPIN = activeProfile.isPIN ?? (activeProfile as any)?.user?.isPIN ?? (activeProfile as any)?.profile?.isPIN;
    const isPINSet = activeProfile.isPINSet ?? (activeProfile as any)?.user?.isPINSet ?? (activeProfile as any)?.profile?.isPINSet;
    return isPIN === true && isPINSet === true;
  }
  return state.isPIN === true && state.isPINSet === true;
};

export const useUserStore = create<UserState>((set, get) => {
  const cachedClient = Storage.getCachedClientProfile();
  const cachedContractor = Storage.getCachedContractorProfile();
  const initialIsPIN = (cachedClient as any)?.isPIN ?? (cachedClient as any)?.user?.isPIN ?? (cachedContractor as any)?.isPIN ?? (cachedContractor as any)?.user?.isPIN;
  const initialIsPINSet = (cachedClient as any)?.isPINSet ?? (cachedClient as any)?.user?.isPINSet ?? (cachedContractor as any)?.isPINSet ?? (cachedContractor as any)?.user?.isPINSet;
  return {
    profile: cachedContractor,
    clientProfile: cachedClient,
    isPIN: initialIsPIN,
    isPINSet: initialIsPINSet,
    isPinSet: (profileData?: any) => {
      const target = profileData || get().clientProfile || get().profile;
      if (target) {
        const isPIN = target.isPIN ?? (target as any)?.user?.isPIN ?? (target as any)?.profile?.isPIN;
        const isPINSet = target.isPINSet ?? (target as any)?.user?.isPINSet ?? (target as any)?.profile?.isPINSet;
        return isPIN === true && isPINSet === true;
      }
      return get().isPIN === true && get().isPINSet === true;
    },
    hasDismissedPinPrompt: false,
    setHasDismissedPinPrompt: (hasDismissedPinPrompt: boolean) => set({ hasDismissedPinPrompt }),
    setIsPIN: (isPIN: boolean) => set({ isPIN }),
    setIsPINSet: (isPINSet: boolean) => set({ isPINSet }),
    setProfile: (profile) => {
      Storage.setCachedContractorProfile(profile);
      const isPIN = (profile as any)?.isPIN ?? (profile as any)?.user?.isPIN;
      const isPINSet = (profile as any)?.isPINSet ?? (profile as any)?.user?.isPINSet;
      set({
        profile,
        ...(isPIN !== undefined ? { isPIN } : {}),
        ...(isPINSet !== undefined ? { isPINSet } : {}),
      });
    },
    setClientProfile: (clientProfile) => {
      Storage.setCachedClientProfile(clientProfile);
      const isPIN = (clientProfile as any)?.isPIN ?? (clientProfile as any)?.user?.isPIN;
      const isPINSet = (clientProfile as any)?.isPINSet ?? (clientProfile as any)?.user?.isPINSet;
      set({
        clientProfile,
        ...(isPIN !== undefined ? { isPIN } : {}),
        ...(isPINSet !== undefined ? { isPINSet } : {}),
      });
    },
    updateClientEmail: (email) => set((state) => {
      const updated = state.clientProfile
        ? { ...state.clientProfile, user: { ...state.clientProfile.user, email, isEmailVerified: true, isEmailUpdated: true } }
        : null;
      if (updated) Storage.setCachedClientProfile(updated);
      return { clientProfile: updated };
    }),
    updateContractorEmail: (email) => set((state) => {
      const updated = state.profile
        ? { ...state.profile, user: { ...state.profile.user, email, isEmailVerified: true, isEmailUpdated: true } }
        : null;
      if (updated) Storage.setCachedContractorProfile(updated);
      return { profile: updated };
    }),
    updateContractorMobile: (mobile) => set((state) => {
      const updated = state.profile
        ? { ...state.profile, user: { ...state.profile.user, mobile, isMobileVerified: true, isMobileUpdated: true } }
        : null;
      if (updated) Storage.setCachedContractorProfile(updated);
      return { profile: updated };
    }),
    updateClientMobile: (mobile) => set((state) => {
      const updated = state.clientProfile
        ? {
          ...state.clientProfile,
          user: { ...state.clientProfile.user, mobile, isMobileVerified: true, isMobileUpdated: true },
          profile: { ...state.clientProfile.profile, phoneNumber: mobile }
        }
        : null;
      if (updated) Storage.setCachedClientProfile(updated);
      return { clientProfile: updated };
    }),
    tempFullName: null,
    setTempFullName: (tempFullName) => set({ tempFullName }),
    clearProfile: () => {
      Storage.deleteKey(Storage.STORAGE_KEYS.CACHED_CONTRACTOR_PROFILE);
      Storage.deleteKey(Storage.STORAGE_KEYS.CACHED_CLIENT_PROFILE);
      set({
        profile: null,
        clientProfile: null,
        isPIN: false,
        isPINSet: false,
        hasDismissedPinPrompt: false,
        tempFullName: null,
        clientTabIndex: 0,
        contractorTabIndex: 0,
        jobsActiveSegment: 'Active',
        disputeLeaveJobIds: [],
        disputedJobIds: []
      });
    },
    getVerificationStatus: (): 'approved' | 'pending' | 'rejected' | 'not_uploaded' => {
      const profile = get().profile;
      const verification = profile?.profile?.governmentIdVerification;
      if (!verification?.sumsubReviewStatus) return 'not_uploaded';

      const status = verification.sumsubReviewStatus;
      if (status === "GREEN") return 'approved';
      if (status === "RED") return 'rejected';
      return 'pending';
    },
    isRestricted: (): boolean => {
      const status = get().getVerificationStatus();
      return status !== 'approved';
    },
    getClientVerificationStatus: (): string => {
      const profile = get().clientProfile;
      return profile?.profile?.businessRegistrationDocument?.verificationStatus || 'pending';
    },
    isClientRestricted: (): boolean => {
      const status = get().getClientVerificationStatus();
      return status !== 'approved';
    },
    clientTabIndex: 0,
    setClientTabIndex: (clientTabIndex) => set({ clientTabIndex }),
    contractorTabIndex: 0,
    setContractorTabIndex: (contractorTabIndex) => set({ contractorTabIndex }),
    jobsActiveSegment: 'Active',
    setJobsActiveSegment: (segment) => set({ jobsActiveSegment: segment }),
    disputeLeaveJobIds: [],
    addDisputeLeaveJobId: (id: string) => set(state => ({
      disputeLeaveJobIds: state.disputeLeaveJobIds.includes(id) ? state.disputeLeaveJobIds : [...state.disputeLeaveJobIds, id]
    })),
    disputedJobIds: [],
    addDisputedJobId: (id: string) => set(state => ({
      disputedJobIds: state.disputedJobIds.includes(id) ? state.disputedJobIds : [...state.disputedJobIds, id]
    }))
  };
});
