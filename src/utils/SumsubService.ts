import { Platform } from 'react-native';
import SNSMobileSDK, { SNSLaunchResult } from '@sumsub/react-native-mobilesdk-module';
import ContractorService from '@config/contractorService';
import colors from '@styles/colors';
import { devDebugger } from '@utils/devDebugger';

class SumsubService {
  /**
   * Fetches a KYC token and launches the Sumsub SDK.
   * @returns Promise<SNSLaunchResult | any>
   */
  static async launchKYC(): Promise<any> {
    try {
      if (Platform.OS === 'web') {
        console.warn('Sumsub SDK is not supported on the web platform using SNSMobileSDK.');
        return { success: false, message: 'Not supported on web' };
      }

      // 1. Get Access Token from backend
      const tokenRes = await ContractorService.getKycAccessToken();

      if (!tokenRes.success || !tokenRes.data?.token) {
        throw new Error(tokenRes.message || 'Failed to fetch verification token');
      }

      const accessToken = tokenRes.data.token;

      // 2. Initialize and Build SDK
      const sdk = SNSMobileSDK.init(accessToken, async () => {
        // Token expiration handler
        const res = await ContractorService.refreshKycAccessToken();
        return res.data?.token || '';
      })
      .withHandlers({
        onStatusChanged: (event) => {
          devDebugger.log(`onStatusChanged: [${event.prevStatus}] => [${event.newStatus}]`);
        },
        onLog: (event) => {
          devDebugger.log(`onLog: [Idensic] ${event.message}`);
        }
      })
      .withTheme({
        primaryColor: colors.primary, // Set button color to match app theme
      })
      .withDebug(__DEV__)
      .withLocale('en')
      .build();

      // 3. Launch and return result
      devDebugger.log("🛡️ [Sumsub] Calling sdk.launch()...");
      const result = await sdk.launch();
      devDebugger.log("SumSub SDK State: " + JSON.stringify(result));
      return result;

    } catch (error: any) {
      devDebugger.error("SumSub SDK Error:", error);
      throw error;
    }
  }
}

export default SumsubService;
