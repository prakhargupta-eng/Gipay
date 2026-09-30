import { create } from 'zustand';
import AuthService from '@config/authService';
import NotificationService from '@config/notificationService';
import { devDebugger } from '@utils/devDebugger';

// Concurrency lock to prevent multiple concurrent network requests for the unread notification count
let isFetchingUnread = false;
// Timestamp of the last successful unread count fetch to throttle rapid successive calls (1.5s cooldown)
let lastFetchTime = 0;

export interface SystemSettings {
  _id: string;
  applicationName: string;
  faviconUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  appStore: string | null;
  googlePlayStore: string | null;
  email: string;
  phone: string | null;
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  cancelLessThan12hrFee: number;
  cancelLessThan24hrFee: number;
  geofenceRadius: number;
  instantPayoutFeePercent: number;
  measurementUnit: string;
  noShowFee: number;
  platformFeePercent: number;
  withdrawalFee: number;
  bookingFeePercent: number;
  transactionFeePercent: number;
  disputeWindowHours: number;
  maxContractorsPerJob: number;
  maxDocumentSize: number;
  maxDocumentSizeUnit: string;
  minDocumentSize: number;
  minDocumentSizeUnit: string;
  autoReleaseHours?: number;
  documentCount?: number;
  withdrawalMin?: number;
  withdrawalMax?: number;
  addMoneyMin?: number;
  addMoneyMax?: number;
}

interface SystemState {
  settings: SystemSettings | null;
  unreadCount: number;
  setSettings: (settings: SystemSettings) => void;
  fetchSettings: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  clearSettings: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  settings: null,
  unreadCount: 0,
  setSettings: (settings) => set({ settings }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  fetchSettings: async () => {
    try {
      const res = await AuthService.getSystemSettings();
      if (res.success && res.data) {
        set({ settings: res.data });
      }
    } catch (error) {
      devDebugger.log('Error fetching system settings:', error);
    }
  },
  /**
   * Fetches the count of unread notifications from the server.
   * Leverages a concurrency lock and a 1.5-second rate-limiting cooldown to prevent double network calls.
   */
  fetchUnreadCount: async () => {
    const now = Date.now();
    // Guard: Prevent double-firing if a fetch is in progress, or occurred less than 1.5 seconds ago
    if (isFetchingUnread || now - lastFetchTime < 1500) {
      return;
    }
    isFetchingUnread = true;
    try {
      const res = await NotificationService.getUnreadCount();
      if (res.success && res.data) {
        // Extract count from API response schema
        const count = res.data.count ?? 0;
        set({ unreadCount: count });
        lastFetchTime = Date.now();
      }
    } catch (error) {
      devDebugger.log('Error fetching unread notification count:', error);
    } finally {
      // Release the fetching lock regardless of success or failure
      isFetchingUnread = false;
    }
  },
  clearSettings: () => set({ settings: null, unreadCount: 0 }),
}));
