import ZendeskSupport from '@shiftsmartinc/react-native-zendesk-support';

import Config from 'react-native-config';
import { devDebugger } from '@utils/devDebugger';

const ZENDESK_URL = Config.ZENDESK_URL;
const APP_ID = Config.ZENDESK_APP_ID;
const CLIENT_ID = Config.ZENDESK_CLIENT_ID;

class ZendeskService {
  private _isZendeskInitialized = false;
  public isZendeskLoading = false;

  async initialize() {
    if (this._isZendeskInitialized) return;

    ZendeskSupport.initialize({
      zendeskUrl: ZENDESK_URL,
      appId: APP_ID,
      clientId: CLIENT_ID
    });

    this._isZendeskInitialized = true;
  }

  async setIdentity(name: string, email: string) {
    await this.initialize();

    (ZendeskSupport as any).setupIdentity({
      customerName: name || 'anonymous_user',
      customerEmail: email || 'anonymous_user@gmail.com',
    });
  }

  async openHelpCenter(name?: string, email?: string) {
    if (this.isZendeskLoading) return;
    this.isZendeskLoading = true;

    try {
      await this.setIdentity(
        name || 'anonymous_user',
        email || 'anonymous_user@gmail.com'
      );
      
      ZendeskSupport.showHelpCenter();
    } catch (e) {
      devDebugger.log('Zendesk error:', e);
      // Optional: reset flag so retry is possible on error
      this._isZendeskInitialized = false;
    } finally {
      await new Promise(resolve => setTimeout(() => resolve(true), 1000)); // 1 second delay
      this.isZendeskLoading = false;
    }
  }

  async openSupport(name?: string, email?: string) {
    if (this.isZendeskLoading) return;
    this.isZendeskLoading = true;

    try {
      await this.setIdentity(
        name || 'anonymous_user',
        email || 'anonymous_user@gmail.com'
      );

      // Create a new support request
      ZendeskSupport.callSupport({});
    } catch (e) {
      devDebugger.log('Zendesk error:', e);
      this._isZendeskInitialized = false;
    } finally {
      await new Promise(resolve => setTimeout(() => resolve(true), 1000));
      this.isZendeskLoading = false;
    }
  }

  async openTicketHistory(name?: string, email?: string) {
    if (this.isZendeskLoading) return;
    this.isZendeskLoading = true;

    try {
      await this.setIdentity(
        name || 'anonymous_user',
        email || 'anonymous_user@gmail.com'
      );

      // Opens user's ticket/request history
      (ZendeskSupport as any).supportHistory();
    } catch (e) {
      devDebugger.log('Zendesk error:', e);
      this._isZendeskInitialized = false;
    } finally {
      await new Promise(resolve => setTimeout(() => resolve(true), 1000));
      this.isZendeskLoading = false;
    }
  }
}

export default new ZendeskService();
