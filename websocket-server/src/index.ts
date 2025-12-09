import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = parseInt(process.env.PORT || '8080', 10);

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
        // console.log('[WebSocket] Message received:', message.type); // Less verbose logging
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

    ws.send(JSON.stringify({
      type: 'room-joined',
      playerId,
      players: allPlayers
    }));

    // Broadcast to OTHER players that a new player joined (excluding the new player)
    this.broadcastToRoom(roomCode, {
      type: 'player-joined',
      playerId,
      playerName,
      position: player.position,
      direction: player.direction
    }, playerId);

    console.log(`[Join] Player ${playerId} (${playerName}) joined room ${roomCode}`);
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

// Setup HTTP server and WebSocket server
const server = createServer((req, res) => {
  res.writeHead(200);
  res.end('Rage WebSocket Server is running');
});

const wss = new WebSocketServer({ server });
const gameServer = new GameServer();

wss.on('connection', (ws) => {
  gameServer.handleConnection(ws);
});

server.listen(PORT, () => {
  console.log(`Rage WebSocket Server is listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  gameServer.shutdown();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  gameServer.shutdown();
  server.close(() => process.exit(0));
});
