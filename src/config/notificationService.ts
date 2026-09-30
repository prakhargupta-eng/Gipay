import apiService from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export interface NotificationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class NotificationService {
  async getNotifications(params: NotificationParams = {}) {
    try {
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await apiService.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAllRead() {
    try {
      const response = await apiService.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markRead(id: string) {
    try {
      const response = await apiService.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new NotificationService();
