declare module 'react-native-config' {
  export interface NativeConfig {
    GOOGLE_MAPS_API_KEY: string;
    ZENDESK_URL: string;
    ZENDESK_APP_ID: string;
    ZENDESK_CLIENT_ID: string;
    GOOGLE_PACKAGE_NAME: string;
    APPLE_APP_ID: string;
    DEV_API_URL: string;
    STAGING_API_URL: string;
    QA_API_URL: string;
    UAT_API_URL: string;
    PROD_API_URL: string;
    RSA_PUBLIC_KEY: string;
  }

  export const Config: NativeConfig
  export default Config
}
