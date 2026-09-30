// src/config/chatService.ts

import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export interface ChatSender {
  _id: string;
  name?: string;
  role?: string;
  avatar?: string;
  profileImage?: string;
}

export interface ChatMessage {
  _id: string;
  jobOrderId: string;
  sender: ChatSender | string;
  senderType?: 'self' | 'user' | 'other';
  message?: string;
  content?: string;
  text?: string;
  clientMessageId?: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatHistoryData {
  messages: ChatMessage[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  isWritable?: boolean;
  readOnlyReason?: string | null;
}

class ChatService {
  /**
   * Fetch chat message history for a given job order via REST API.
   * Called only once on initial screen load or manual pagination.
   */
  static async getMessages(
    jobOrderId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ChatHistoryData | ChatMessage[]>> {
    return ApiService.get(API_ENDPOINTS.CHAT.GET_MESSAGES(jobOrderId), {
      page,
      limit,
    });
  }
}

export default ChatService;
