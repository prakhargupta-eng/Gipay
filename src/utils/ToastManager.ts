import { devDebugger } from '@utils/devDebugger';

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'notification';
  text1?: string;
  text2?: string;
  duration?: number;
}

export class Toast {
  private static instances: any[] = [];

  static setInstance(instance: any) {
    this.instances = instance ? [instance] : [];
  }

  static pushInstance(instance: any) {
    if (instance && !this.instances.includes(instance)) {
      this.instances.push(instance);
    }
  }

  static popInstance(instance?: any) {
    if (instance) {
      this.instances = this.instances.filter(inst => inst !== instance);
    } else {
      this.instances.pop();
    }
  }

  static show(options: ToastOptions) {
    const current = this.instances[this.instances.length - 1];
    if (current) {
      current.show(options);
    } else {
      devDebugger.warn('Toast instance not set. Call Toast.setInstance(ref) in App.tsx');
    }
  }

  static showSuccess(message: string) {
    this.show({ type: 'success', text1: message });
  }

  static showError(message: string) {
    this.show({ type: 'error', text1: message });
  }

  static showInfo(message: string) {
    this.show({ type: 'info', text1: message });
  }
}
