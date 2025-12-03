import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket, { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Room management for WebSocket connections
interface GamePlayer {
  id: string;
  name: string;
  ws: WebSocket;
  position: { x: number; y: number };
  direction: 'left' | 'right';
  lastSeen: number;
}

class GameServer {
  private rooms = new Map<string, Map<string, GamePlayer>>();
  private playerToRoom = new Map<string, string>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeCleanup();
  }

  private initializeCleanup() {
    // Cleanup disconnected players every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupDisconnectedPlayers();
    }, 30000);
  }

  private cleanupDisconnectedPlayers() {
    for (const [roomCode, players] of this.rooms.entries()) {
      for (const [playerId, player] of players.entries()) {
        if (player.ws.readyState !== WebSocket.OPEN) {
          players.delete(playerId);
          this.playerToRoom.delete(playerId);
          this.broadcastToRoom(roomCode, {
            type: 'player-left',
            playerId
          });
        }
      }
      
      // Delete empty rooms
      if (players.size === 0) {
        this.rooms.delete(roomCode);
      }
    }
  }

  handleConnection(ws: WebSocket) {
    console.log('[WebSocket] New connection established');

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('[WebSocket] Message received:', message.type, message);
        this.handleMessage(ws, message);
      } catch (err) {
        console.error('[Message Error]:', err);
      }
    });

    ws.on('error', (err) => {
      console.error('[WebSocket Error]:', err);
    });

    ws.on('close', () => {
      console.log('[WebSocket] Connection closed');
      this.handleDisconnect(ws);
    });

    ws.on('ping', () => {
      ws.pong();
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, roomCode, playerId, playerName, position, direction, level } = message;

    try {
      switch (type) {
        case 'join-room':
          this.handleJoinRoom(ws, roomCode, playerId, playerName);
          break;

        case 'move':
          this.handlePlayerMove(roomCode, playerId, position, direction);
          break;

        case 'level-complete':
          this.handleLevelComplete(roomCode, playerId, level);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          console.warn(`[Unknown message type] ${type}`);
      }
    } catch (err) {
      console.error('[Handle Message Error]:', err);
    }
  }

  private handleJoinRoom(ws: WebSocket, roomCode: string, playerId: string, playerName: string) {
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, new Map());
      console.log(`[Room Created] ${roomCode}`);
    }

    const room = this.rooms.get(roomCode)!;
    
    // Get existing players BEFORE adding new player
    const existingPlayers = Array.from(room.values()).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      direction: p.direction
    }));
    
    console.log(`[Join] Room ${roomCode} has ${existingPlayers.length} existing players`);
    
    const player: GamePlayer = {
      id: playerId,
      name: playerName,
      ws,
      position: { x: 50, y: 400 },
      direction: 'right',
      lastSeen: Date.now()
    };

    room.set(playerId, player);
    this.playerToRoom.set(playerId, roomCode);

    // Send ALL players in room (including newly joined player) to the joining player
    const allPlayers = Array.from(room.values()).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      direction: p.direction
    }));

    console.log(`[Join] Sending room-joined to ${playerId} with ${allPlayers.length} total players`);
    
    ws.send(JSON.stringify({
      type: 'room-joined',
      playerId,
      players: allPlayers
    }));

    // Broadcast to OTHER players that a new player joined (excluding the new player)
    console.log(`[Join] Broadcasting player-joined to ${existingPlayers.length} existing players`);
    
    this.broadcastToRoom(roomCode, {
      type: 'player-joined',
      playerId,
      playerName,
      position: player.position,
      direction: player.direction
    }, playerId);

    console.log(`[Join] Player ${playerId} (${playerName}) joined room ${roomCode} - Total players: ${room.size}`);
  }

  private handlePlayerMove(roomCode: string, playerId: string, position: any, direction: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.get(playerId);
    if (player) {
      player.position = position;
      player.direction = direction as 'left' | 'right';
      player.lastSeen = Date.now();

      // Broadcast position update immediately to all other players
      this.broadcastToRoom(roomCode, {
        type: 'player-moved',
        playerId,
        position,
        direction
      }, playerId);
    }
  }

  private handleLevelComplete(roomCode: string, playerId: string, level: number) {
    // Broadcast level completion to all players in the room
    this.broadcastToRoom(roomCode, {
      type: 'level-advance',
      playerId,
      level
    });
    
    console.log(`[Level Complete] Player ${playerId} completed level ${level} in room ${roomCode}`);
  }

  private broadcastToRoom(roomCode: string, message: any, excludePlayerId?: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const jsonMessage = JSON.stringify(message);
    
    for (const [playerId, player] of room.entries()) {
      if (player.ws.readyState === WebSocket.OPEN) {
        if (excludePlayerId !== playerId) {
          player.ws.send(jsonMessage);
        }
      }
    }
  }

  private handleDisconnect(ws: WebSocket) {
    // Find player by WebSocket connection
    for (const [playerId, roomCode] of this.playerToRoom.entries()) {
      const room = this.rooms.get(roomCode);
      if (room) {
        const player = room.get(playerId);
        if (player && player.ws === ws) {
          room.delete(playerId);
          this.playerToRoom.delete(playerId);

          this.broadcastToRoom(roomCode, {
            type: 'player-left',
            playerId
          });

          console.log(`[Disconnect] Player ${playerId} left room ${roomCode}`);
          break;
        }
      }
    }
  }

  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.rooms.clear();
    this.playerToRoom.clear();
  }
}

console.log('[Server] Preparing Next.js app...');

app.prepare().then(() => {
  console.log('[Server] Next.js app prepared successfully');
  
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });
  const gameServer = new GameServer();

  // Handle WebSocket upgrade
  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '', true);
    
    console.log(`[Upgrade] WebSocket upgrade request for path: ${pathname}`);
    
    // Only handle WebSocket upgrades for /ws path
    if (pathname === '/ws') {
      try {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
          gameServer.handleConnection(ws);
        });
      } catch (err) {
        console.error('[Upgrade Error]:', err);
        socket.destroy();
      }
    } else {
      console.log(`[Upgrade] Rejected - path ${pathname} not /ws`);
      socket.destroy();
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`✓ Ready on http://localhost:${PORT}`);
    console.log(`✓ WebSocket server ready on ws://localhost:${PORT}/ws`);
    console.log('[Server] Waiting for WebSocket connections...');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully...');
    gameServer.shutdown();
    httpServer.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully...');
    gameServer.shutdown();
    httpServer.close(() => {
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('[Server] Failed to prepare Next.js app:', err);
  process.exit(1);
});