declare module '@shiftsmartinc/react-native-zendesk-support' {
  export interface ZendeskInitializeOptions {
    appId: string;
    clientId: string;
    zendeskUrl: string;
  }

  const ZendeskSupport: {
    initialize(options: ZendeskInitializeOptions): void;
    identifyAnonymous(name: string, email: string): void;
    identifyJWT(token: string): void;
    callSupport(customFields?: Record<string, string>): void;
    showHelpCenter(): void;
  };

  export default ZendeskSupport;
}
