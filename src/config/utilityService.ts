import ApiService, { ApiResponse } from './apiService';
import { API_ENDPOINTS } from './apiConfig';

class UtilityService {
  /**
   * Get CMS Content (Privacy Policy, Terms, etc.)
   * @param slug content slug
   */
  static async getContent(slug: string): Promise<ApiResponse<any>> {
    return ApiService.get(`${API_ENDPOINTS.UTIL.CONTENT}?slug=${slug}`);
  }

  /**
   * Get FAQ list
   * @param lang language code (default 'en')
   */
  static async getFaqs(lang: string = 'en'): Promise<ApiResponse<any>> {
    return ApiService.get(`${API_ENDPOINTS.UTIL.FAQS}?lang=${lang}`);
  }
}

export default UtilityService;
