export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ReconnectConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
}

export class GameWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private playerId: string | null = null;
  private roomCode: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private messageHandlers = new Map<string, Set<(msg: any) => void>>();
  private config: Required<ReconnectConfig>;
  private isIntentionalClose = false;

  constructor(config: ReconnectConfig = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 10,
      initialDelay: config.initialDelay ?? 500,
      maxDelay: config.maxDelay ?? 30000,
      jitter: config.jitter ?? true,
    };

    // Determine WebSocket URL
    if (process.env.NEXT_PUBLIC_WS_URL) {
      this.url = process.env.NEXT_PUBLIC_WS_URL;
    } else if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.url = `${protocol}//${window.location.host}/ws`;
    } else {
      this.url = 'ws://localhost:8080';
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionalClose = false;
        console.log('[WS Client] Connecting to:', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WS Client] Connected successfully');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[WS Client] Message received:', message.type, message);
            this.dispatchMessage(message);
          } catch (err) {
            console.error('[WS Client] Message Parse Error:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WS Client] Error:', error);
        };

        this.ws.onclose = () => {
          console.log('[WS Client] Disconnected');
          this.stopHeartbeat();

          // Only attempt reconnect if not intentionally closed
          if (!this.isIntentionalClose) {
            this.attemptReconnect();
          }
        };
      } catch (err) {
        console.error('[WS Client] Connection error:', err);
        reject(err);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxAttempts) {
      console.error('[Reconnect] Max attempts reached');
      this.dispatchMessage({ type: 'reconnect-failed' });
      return;
    }

    const delay = this.calculateBackoffDelay(this.reconnectAttempts);
    console.log(`[Reconnect] Attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect()
        .then(() => {
          // Re-join room after reconnection
          if (this.roomCode && this.playerId) {
            this.send({
              type: 'join-room',
              roomCode: this.roomCode,
              playerId: this.playerId,
              playerName: 'Reconnected Player'
            });
          }
        })
        .catch((err) => {
          console.error('[Reconnect Failed]:', err);
        });
    }, delay);
  }

  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.config.initialDelay * Math.pow(2, attempt),
      this.config.maxDelay
    );

    if (this.config.jitter) {
      return delay + Math.random() * 1000;
    }
    return delay;
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  joinRoom(roomCode: string, playerId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomCode = roomCode;
      this.playerId = playerId;

      const unsub = this.on('room-joined', (msg) => {
        unsub();
        resolve();
      });

      this.send({
        type: 'join-room',
        roomCode,
        playerId,
        playerName,
      });

      setTimeout(() => {
        unsub();
        reject(new Error('Join room timeout'));
      }, 5000);
    });
  }

  movePlayer(position: { x: number; y: number }, direction: 'left' | 'right') {
    if (!this.roomCode || !this.playerId) return;

    this.send({
      type: 'move',
      roomCode: this.roomCode,
      playerId: this.playerId,
      position,
      direction,
    });
  }

  levelComplete(level: number) {
    if (!this.roomCode || !this.playerId) return;

    this.send({
      type: 'level-complete',
      roomCode: this.roomCode,
      playerId: this.playerId,
      level,
    });
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS Client] Sending message:', message.type, message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS Client] Cannot send - WebSocket not connected. ReadyState:', this.ws?.readyState);
    }
  }

  private dispatchMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  on(type: string, handler: (msg: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  disconnect() {
    this.isIntentionalClose = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.stopHeartbeat();
    this.messageHandlers.clear();
    this.ws?.close();
    this.ws = null;
    this.playerId = null;
    this.roomCode = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}