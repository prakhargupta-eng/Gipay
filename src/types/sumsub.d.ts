declare module '@sumsub/react-native-mobilesdk-module' {
  export interface SNSMobileSDK {
    init(accessToken: string, tokenExpirationHandler: () => Promise<string>): SNSMobileSDKBuilder;
  }

  export interface SNSMobileSDKBuilder {
    withHandlers(handlers: SNSHandlers): SNSMobileSDKBuilder;
    withDebug(debug: boolean): SNSMobileSDKBuilder;
    withLocale(locale: string): SNSMobileSDKBuilder;
    withTheme(theme: { [key: string]: any }): SNSMobileSDKBuilder;
    build(): SNSMobileSDKInstance;
  }

  export interface SNSStatusChangedEvent {
    newStatus: string;
    prevStatus: string;
  }

  export interface SNSLogEvent {
    message: string;
  }

  export interface SNSHandlers {
    onStatusChanged?: (event: SNSStatusChangedEvent) => void;
    onLog?: (event: SNSLogEvent) => void;
  }

  export interface SNSMobileSDKInstance {
    launch(): Promise<SNSLaunchResult>;
  }

  export interface SNSLaunchResult {
    status: 'Approved' | 'Pending' | 'ActionCompleted' | 'Canceled' | 'Failed' | string;
    error?: string;
  }

  const SNSMobileSDK: SNSMobileSDK;
  export default SNSMobileSDK;
}
