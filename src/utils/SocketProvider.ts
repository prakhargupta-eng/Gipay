// src/utils/SocketProvider.ts
import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from '@config/apiConfig';
import eventBus from '@utils/eventBus';
import { devDebugger } from '@utils/devDebugger';

export const SOCKET_EVENTS = {
  // Connection Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',

  JOIN_CHAT: 'joinChat',
  CHAT_UPDATE_EVENT: 'chatListUpdated',
  DELETE_CHAT: 'deleteChat',

  GET_CHAT_LIST: 'getChatList',
  GET_UNREAD_COUNT: 'getUnreadCount',

  // Chat Events
  MARK_MESSAGE_AS_READ: 'markMessageAsRead',
  MARK_MESSAGES_AS_READ: 'markMessagesAsRead',

  // Chat History
  GET_CHAT_HISTORY: 'getChatHistory',

  // Receive / Send MSG
  RECEIVE_MESSAGE: 'receiveMessage',
  SEND_MESSAGE: 'sendMessage',
} as const;

class SocketService {
  socket: Socket | null = null;
  token: string | null = null;
  eventListeners: Map<string, (...args: any[]) => void> = new Map();
  isConnecting: boolean = false;
  connectionPromise: Promise<Socket> | null = null;
  onAnyCallback: ((event: string, ...args: any[]) => void) | null = null;
  hasEmittedConnectEvent: boolean = false;
  wasDisconnected: boolean = false;

  setToken = (token: string | null) => {
    if (this.token === token) return;

    this.token = token;

    if (this.socket) {
      this.cleanupSocket();
    }
  };

  cleanupSocket = () => {
    if (this.socket) {
      this.eventListeners.forEach((listener, eventName) => {
        this.socket?.off(eventName, listener);
      });

      this.socket.offAny();
      this.socket.disconnect();
      this.socket = null;

      devDebugger.log('🧹 Socket cleaned up');
    }

    this.isConnecting = false;
    this.connectionPromise = null;
    this.onAnyCallback = null;
    this.hasEmittedConnectEvent = false;
    this.wasDisconnected = false;
  };

  reRegisterEventListeners = () => {
    devDebugger.log('🔄 Re-registering event listeners after reconnection...');

    this.eventListeners.forEach((listener, eventName) => {
      devDebugger.log(`🔄 Re-registering listener for: ${eventName}`);
      this.socket?.on(eventName, listener);
    });

    if (this.onAnyCallback && this.socket) {
      devDebugger.log('🔄 Re-registering onAny callback');
      this.socket.onAny(this.onAnyCallback);
    }
  };

  connect = (): Promise<Socket> => {
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }

    if (!this.token) {
      return Promise.reject(new Error('SocketService: token not set'));
    }

    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const baseUrl = getBaseUrl();
        const socketUrl = baseUrl ? baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') : '';
        devDebugger.log('🔌 Connecting socket to:', socketUrl);

        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          auth: {
            token: this.token,
          },
        });

        this.socket.on('connect', () => {
          devDebugger.log('✅ Socket connected:', this.socket?.id);
          this.isConnecting = false;

          // Only emit connectSocketAgain if this is a REconnection (not initial connection)
          if (this.wasDisconnected) {
            devDebugger.log('🔄 Emitting connectSocketAgain (reconnection detected)');
            eventBus.emit('connectSocketAgain');
            this.wasDisconnected = false;
          } else if (!this.hasEmittedConnectEvent) {
            devDebugger.log('✅ Initial connection established');
            this.hasEmittedConnectEvent = true;
          }

          this.reRegisterEventListeners();
          if (this.socket) {
            resolve(this.socket);
          }
        });

        this.socket.on('connect_error', (err: any) => {
          devDebugger.error('❌ Connection error:', err?.message || err);
          this.isConnecting = false;
          this.wasDisconnected = true;
          reject(err);
        });

        this.socket.on('disconnect', (reason: string) => {
          devDebugger.log('❌ Socket disconnected:', reason);
          this.wasDisconnected = true;

          if (reason === 'io client disconnect') {
            this.isConnecting = false;
            this.connectionPromise = null;
            this.hasEmittedConnectEvent = false;
          }
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          devDebugger.log(`🔄 Reconnection attempt #${attemptNumber}`);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
          devDebugger.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
          this.isConnecting = false;
        });

        this.socket.on('reconnect_error', (err: any) => {
          devDebugger.error('❌ Reconnection error:', err?.message || err);
        });

        this.socket.on('reconnect_failed', () => {
          devDebugger.error('❌ Reconnection failed - all attempts exhausted');
          this.isConnecting = false;
          this.connectionPromise = null;
          this.wasDisconnected = true;
        });
      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        this.wasDisconnected = true;
        reject(error);
      }
    });

    return this.connectionPromise;
  };

  disconnect = () => {
    if (this.socket) {
      this.eventListeners.forEach((listener, eventName) => {
        this.socket?.off(eventName, listener);
      });

      this.socket.offAny();
      this.socket.disconnect();
      this.socket = null;

      devDebugger.log('🔌 Socket manually disconnected');
    }

    this.isConnecting = false;
    this.connectionPromise = null;
    this.hasEmittedConnectEvent = false;
    this.wasDisconnected = false;
  };

  destroy = () => {
    this.cleanupSocket();
    this.eventListeners.clear();
    this.onAnyCallback = null;
    devDebugger.log('💥 SocketService destroyed');
  };

  send = (eventName: string, params: any, callback?: (response: any, error?: any) => void) => {
    this.connect()
      .then(() => {
        try {
          devDebugger.log('📤 Emitting:', eventName, params);
          this.socket?.emit(eventName, params, (response: any) => {
            devDebugger.log('✅ Ack received for', eventName, response);
            if (callback) {
              try {
                callback(response);
              } catch (callbackError) {
                devDebugger.error('❌ Error in send callback:', callbackError);
              }
            }
          });
        } catch (emitError) {
          devDebugger.error('❌ Error during emit:', emitError);
          if (callback) callback(null, emitError);
        }
      })
      .catch((err: any) => {
        devDebugger.error('❌ Socket emit error:', err?.message || err);
        if (callback) callback(null, err);
      });
  };

  receive = (eventName: string, callback: (data: any, error?: any) => void) => {
    this.offReceive(eventName);

    const wrappedCallback = (data: any) => {
      try {
        devDebugger.log(`✅ Event received: ${eventName}`, data);
        if (callback) callback(data);
      } catch (callbackError) {
        devDebugger.error(`❌ Error in receive callback for ${eventName}:`, callbackError);
        if (callback) callback(null, callbackError);
      }
    };

    this.eventListeners.set(eventName, wrappedCallback);

    if (this.socket && this.socket.connected) {
      devDebugger.log(`📩 Adding listener for event: ${eventName}`);
      this.socket.on(eventName, wrappedCallback);
      return;
    }

    this.connect()
      .then(() => {
        devDebugger.log(`📩 Listening for event: ${eventName}`);
        this.socket?.on(eventName, wrappedCallback);
      })
      .catch((err: any) => {
        devDebugger.error(`❌ Socket receive error for ${eventName}:`, err?.message || err);
        this.eventListeners.delete(eventName);
        if (callback) {
          try {
            callback(null, err);
          } catch (callbackError) {
            devDebugger.error('❌ Error in receive error callback:', callbackError);
          }
        }
      });
  };

  offReceive = (eventName: string) => {
    const listener = this.eventListeners.get(eventName);
    if (this.socket && listener) {
      devDebugger.log(`🧹 Removing listener for event: ${eventName}`);
      this.socket.off(eventName, listener);
    }
    this.eventListeners.delete(eventName);
  };

  removeAllListeners = () => {
    this.eventListeners.forEach((listener, eventName) => {
      if (this.socket) {
        this.socket.off(eventName, listener);
      }
    });
    this.eventListeners.clear();
    devDebugger.log('🧹 Removed all custom event listeners');
  };

  onAny = (callback: (event: string, ...args: any[]) => void) => {
    this.onAnyCallback = (event: string, ...args: any[]) => {
      try {
        devDebugger.log('📡 [onAny] Event from server:', event, args);
        if (callback) callback(event, ...args);
      } catch (callbackError) {
        devDebugger.error('❌ Error in onAny callback:', callbackError);
      }
    };

    this.connect()
      .then(() => {
        this.socket?.onAny(this.onAnyCallback!);
      })
      .catch((err: any) => {
        devDebugger.error('❌ Socket onAny error:', err?.message || err);
      });
  };

  offAny = () => {
    if (this.socket) {
      this.socket.offAny();
      devDebugger.log('🧹 Removed all onAny listeners');
    }
    this.onAnyCallback = null;
  };

  isConnected = (): boolean => {
    return !!(this.socket && this.socket.connected);
  };

  getSocketId = (): string | null => {
    return this.socket ? this.socket.id || null : null;
  };

  reconnect = () => {
    if (this.socket) {
      devDebugger.log('🔄 Forcing reconnection...');
      this.wasDisconnected = true;
      this.socket.disconnect();
      this.socket.connect();
    } else {
      return this.connect();
    }
  };

  isReconnecting = (): boolean => {
    return !!(this.socket && this.socket.disconnected && (this.socket.io as any)?._reconnection);
  };
}

const socketService = new SocketService();
export default socketService;
