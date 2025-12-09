"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Player, GameState, MultiplayerPlayer, RoomData, Platform } from '@/lib/gameTypes';
import { LEVELS } from '@/lib/levels';
import { Button } from '@/components/ui/button';
import { Heart, RotateCcw, Play, Pause, RotateCw, SkipForward, Users, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GameWebSocketClient } from '@/lib/websocket-client';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_GRAVITY = 0.6;
const FRICTION = 0.8;
const PROGRESS_KEY = 'rage_game_progress';

// Sound effects using Web Audio API
const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Silently fail if audio context not available
  }
};

const sounds = {
  jump: () => playSound(400, 0.1, 'square'),
  death: () => playSound(100, 0.3, 'sawtooth'),
  complete: () => playSound(600, 0.2, 'sine'),
  razor: () => playSound(800, 0.05, 'triangle'),
  crush: () => playSound(150, 0.15, 'square'),
  shake: () => playSound(80, 0.08, 'sawtooth'),
  bossTension: () => playSound(200, 0.5, 'triangle'),
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastJumpTime = useRef<number>(0);
  const bossAudioInterval = useRef<NodeJS.Timeout | null>(null);
  const wsClientRef = useRef<GameWebSocketClient | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0,
    lives: 3,
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    levelComplete: false,
    message: ''
  });

  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 400,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    isJumping: false,
    isGrounded: false,
    direction: 'right'
  });

  // Multiplayer state
  const [multiplayerMode, setMultiplayerMode] = useState(false);
  const [showMultiplayerSetup, setShowMultiplayerSetup] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<MultiplayerPlayer[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const platformsRef = useRef<Platform[]>([]);
  const shakeOffsetRef = useRef({ x: 0, y: 0 });
  const currentGravityRef = useRef(DEFAULT_GRAVITY);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    if (savedProgress) {
      const savedLevel = parseInt(savedProgress, 10);
      if (savedLevel > 0 && savedLevel < LEVELS.length) {
        setGameState(prev => ({
          ...prev,
          currentLevel: savedLevel
        }));
      }
    }
  }, []);

  // Boss level ambient sound
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      const currentLevel = LEVELS[gameState.currentLevel];
      if (currentLevel?.isBossLevel) {
        bossAudioInterval.current = setInterval(() => {
          sounds.bossTension();
        }, 3000);
      }
    }

    return () => {
      if (bossAudioInterval.current) {
        clearInterval(bossAudioInterval.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.currentLevel]);

  // WebSocket: Initialize connection and event handlers
  useEffect(() => {
    if (!multiplayerMode || !roomData) return;

    console.log('[Game] Initializing WebSocket for room:', roomData.code, 'playerId:', roomData.playerId);

    const wsClient = new GameWebSocketClient({
      maxAttempts: 10,
      initialDelay: 500,
      maxDelay: 30000,
    });

    wsClientRef.current = wsClient;

    // Setup message handlers
    const unsubRoomJoined = wsClient.on('room-joined', (msg) => {
      console.log('[Game] room-joined received:', msg);
      console.log('[Game] My playerId:', roomData.playerId);
      console.log('[Game] Players in room:', msg.players);
      setWsConnected(true);

      // Update other players list (exclude myself)
      const others = msg.players.filter((p: any) => p.id !== roomData.playerId);
      console.log('[Game] Other players after filtering:', others);

      setOtherPlayers(others.map((p: any) => ({
        id: p.id,
        playerName: p.name,
        playerColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
        positionX: p.position.x,
        positionY: p.position.y,
        direction: p.direction
      })));

      console.log('[Game] Set wsConnected to true, otherPlayers count:', others.length);
    });

    const unsubPlayerJoined = wsClient.on('player-joined', (msg) => {
      console.log('[Game] player-joined received:', msg);
      console.log('[Game] Adding player:', msg.playerId, msg.playerName);

      setOtherPlayers(prev => {
        console.log('[Game] Previous other players:', prev);
        const newPlayers = [...prev, {
          id: msg.playerId,
          playerName: msg.playerName,
          playerColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          positionX: msg.position.x,
          positionY: msg.position.y,
          direction: msg.direction
        }];
        console.log('[Game] New other players:', newPlayers);
        return newPlayers;
      });
    });

    const unsubPlayerLeft = wsClient.on('player-left', (msg) => {
      console.log('[Game] player-left received:', msg);
      setOtherPlayers(prev => prev.filter(p => p.id !== msg.playerId));
    });

    const unsubPlayerMoved = wsClient.on('player-moved', (msg) => {
      // Update player position in real-time
      setOtherPlayers(prev => prev.map(p =>
        p.id === msg.playerId
          ? { ...p, positionX: msg.position.x, positionY: msg.position.y, direction: msg.direction }
          : p
      ));
    });

    const unsubLevelAdvance = wsClient.on('level-advance', (msg) => {
      console.log('[Game] Level advance:', msg);
      const nextLevel = msg.level + 1;

      // Advance to next level
      setGameState(prev => ({
        ...prev,
        currentLevel: nextLevel,
        levelComplete: false,
        message: '🎉 Team advanced to next level!'
      }));

      setTimeout(() => {
        setGameState(prev => ({ ...prev, message: '' }));
      }, 2000);

      initLevel(nextLevel);
      sounds.complete();
    });

    const unsubReconnectFailed = wsClient.on('reconnect-failed', () => {
      setWsConnected(false);
      setGameState(prev => ({ ...prev, message: '❌ Connection lost' }));
    });

    // Connect to WebSocket server
    wsClient.connect()
      .then(() => {
        console.log('[Game] Connected, joining room...');
        return wsClient.joinRoom(roomData.code, roomData.playerId.toString(), roomData.playerName);
      })
      .catch((err) => {
        console.error('[Game] Connection failed:', err);
        setGameState(prev => ({ ...prev, message: '❌ Failed to connect' }));
      });

    // Cleanup on unmount
    return () => {
      unsubRoomJoined();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubPlayerMoved();
      unsubLevelAdvance();
      unsubReconnectFailed();
      wsClient.disconnect();
    };
  }, [multiplayerMode, roomData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomData) {
        // Leave room on unmount
        fetch(`/api/rooms/${roomData.code}/leave?playerId=${roomData.playerId}`, {
          method: 'DELETE'
        }).catch(console.error);
      }
    };
  }, [roomData]);

  // Create multiplayer room
  const createRoom = async () => {
    if (!playerName.trim()) return;

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName.trim() })
      });

      const data = await response.json();

      // Join the room as host
      const joinResponse = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, playerName: playerName.trim() })
      });

      const joinData = await joinResponse.json();

      setRoomData({
        code: data.code,
        roomId: data.roomId,
        playerId: joinData.playerId,
        playerName: playerName.trim(),
        playerColor: joinData.playerColor,
        isHost: true
      });

      setMultiplayerMode(true);
      setShowMultiplayerSetup(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  // Join multiplayer room
  const joinRoom = async () => {
    if (!playerName.trim() || !joinCode.trim()) return;

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase(), playerName: playerName.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        setGameState(prev => ({ ...prev, message: error.error || 'Failed to join room' }));
        return;
      }

      const data = await response.json();

      // Fetch room to get current level
      const roomResponse = await fetch(`/api/rooms/${joinCode.trim().toUpperCase()}`);
      const roomData = await roomResponse.json();

      setRoomData({
        code: joinCode.trim().toUpperCase(),
        roomId: data.roomId,
        playerId: data.playerId,
        playerName: playerName.trim(),
        playerColor: data.playerColor,
        isHost: false
      });

      // Set current level to match room level
      if (roomData.room) {
        setGameState(prev => ({
          ...prev,
          currentLevel: roomData.room.currentLevel
        }));
      }

      setMultiplayerMode(true);
      setShowMultiplayerSetup(false);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    if (roomData) {
      navigator.clipboard.writeText(roomData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Leave room
  const leaveRoom = async () => {
    if (roomData) {
      try {
        await fetch(`/api/rooms/${roomData.code}/leave?playerId=${roomData.playerId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to leave room:', error);
      }

      // Disconnect WebSocket
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }

      setRoomData(null);
      setMultiplayerMode(false);
      setOtherPlayers([]);
      setWsConnected(false);
    }
  };

  // Save progress to localStorage
  const saveProgress = useCallback((levelIndex: number) => {
    localStorage.setItem(PROGRESS_KEY, levelIndex.toString());
  }, []);

  // Reset all progress
  const resetProgress = () => {
    localStorage.removeItem(PROGRESS_KEY);
    setGameState({
      currentLevel: 0,
      lives: 3,
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      levelComplete: false,
      message: ''
    });
    initLevel(0);
  };

  // Initialize level
  const initLevel = useCallback((levelIndex: number) => {
    if (levelIndex >= LEVELS.length) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        message: '🎉 You completed all levels! You are a true platformer master!'
      }));
      return;
    }

    const level = LEVELS[levelIndex];
    const newPlatforms = level.platforms.map(p => ({
      ...p,
      startX: p.startX ?? p.x,
      startY: p.startY ?? p.y,
      isVisible: true,
      touchCount: 0,
      rotation: p.rotation ?? 0
    }));

    platformsRef.current = newPlatforms;
    currentGravityRef.current = level.gravity ?? DEFAULT_GRAVITY;

    setPlayer({
      ...player,
      x: level.startPosition.x,
      y: level.startPosition.y,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      isGrounded: false
    });

    setGameState(prev => ({
      ...prev,
      currentLevel: levelIndex,
      levelComplete: false,
      message: ''
    }));
  }, []);

  // Start game from saved progress or current level
  const startGame = () => {
    const startLevel = gameState.currentLevel;
    setGameState(prev => ({
      ...prev,
      lives: 3,
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      levelComplete: false,
      message: ''
    }));
    initLevel(startLevel);
  };

  // Reset level
  const resetLevel = () => {
    if (gameState.gameOver) {
      startGame();
    } else {
      initLevel(gameState.currentLevel);
    }
  };

  // Next level - broadcast via WebSocket in multiplayer
  const nextLevel = async () => {
    const nextLevelIndex = gameState.currentLevel + 1;
    saveProgress(nextLevelIndex);

    // In multiplayer, broadcast level completion via WebSocket
    if (multiplayerMode && wsClientRef.current) {
      wsClientRef.current.levelComplete(gameState.currentLevel);
    }

    initLevel(nextLevelIndex);
    sounds.complete();
  };

  // Skip level
  const skipLevel = () => {
    const nextLevelIndex = gameState.currentLevel + 1;
    if (nextLevelIndex >= LEVELS.length) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        message: '🎉 You completed all levels! You are a true platformer master!'
      }));
      return;
    }
    saveProgress(nextLevelIndex);
    initLevel(nextLevelIndex);
  };

  // Handle player death
  const handleDeath = useCallback(() => {
    sounds.death();
    const newLives = gameState.lives - 1;
    if (newLives <= 0) {
      setGameState(prev => ({
        ...prev,
        lives: 0,
        isPlaying: false,
        gameOver: true,
        message: '💀 Game Over! The devil got you!'
      }));
    } else {
      setGameState(prev => ({ ...prev, lives: newLives }));
      initLevel(gameState.currentLevel);
    }
  }, [gameState.lives, gameState.currentLevel, initLevel]);

  // Collision detection
  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // Check if player is in a gravity zone
  const getGravityForPosition = (x: number, y: number) => {
    const level = LEVELS[gameState.currentLevel];
    if (!level.gravityZones) return level.gravity ?? DEFAULT_GRAVITY;

    for (const zone of level.gravityZones) {
      if (x >= zone.x && x <= zone.x + zone.width &&
        y >= zone.y && y <= zone.y + zone.height) {
        return zone.gravity;
      }
    }

    return level.gravity ?? DEFAULT_GRAVITY;
  };

  // Update moving platforms and special mechanics
  const updatePlatforms = () => {
    platformsRef.current.forEach(platform => {
      // Update rotation for razors
      if (platform.type === 'razor' && platform.rotationSpeed) {
        platform.rotation = (platform.rotation || 0) + platform.rotationSpeed;
      }

      // Update movement
      if (platform.moveDirection) {
        if (platform.moveDirection === 'horizontal') {
          const distance = platform.x - platform.startX!;
          if (Math.abs(distance) >= platform.moveRange!) {
            platform.moveSpeed = -platform.moveSpeed!;
          }
          platform.x += platform.moveSpeed!;
        } else if (platform.moveDirection === 'vertical') {
          const distance = platform.y - platform.startY!;
          if (Math.abs(distance) >= platform.moveRange!) {
            platform.moveSpeed = -platform.moveSpeed!;
            if (platform.type === 'crushing') {
              sounds.crush();
            }
          }
          platform.y += platform.moveSpeed!;
        }
      }
    });
  };

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const level = LEVELS[gameState.currentLevel];

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = level.backgroundColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw gravity zones
      if (level.gravityZones) {
        level.gravityZones.forEach(zone => {
          ctx.fillStyle = zone.color || 'rgba(147, 51, 234, 0.2)';
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

          // Draw zone indicator
          ctx.strokeStyle = zone.gravity < 0 ? '#a855f7' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
          ctx.setLineDash([]);
        });
      }

      // Update platforms
      updatePlatforms();

      // Calculate screen shake for boss levels
      let screenShakeX = 0;
      let screenShakeY = 0;
      if (level.isBossLevel) {
        screenShakeX = Math.sin(timestamp * 0.01) * 2;
        screenShakeY = Math.cos(timestamp * 0.015) * 2;
      }

      // Update player physics
      let newPlayer = { ...player };

      // Get current gravity based on player position
      const currentGravity = getGravityForPosition(
        newPlayer.x + newPlayer.width / 2,
        newPlayer.y + newPlayer.height / 2
      );

      // Horizontal movement
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        newPlayer.velocityX = -newPlayer.speed;
        newPlayer.direction = 'left';
      } else if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        newPlayer.velocityX = newPlayer.speed;
        newPlayer.direction = 'right';
      } else {
        newPlayer.velocityX *= FRICTION;
      }

      // Jump
      if ((keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has(' ')) && newPlayer.isGrounded) {
        if (timestamp - lastJumpTime.current > 200) {
          // Adjust jump power based on current gravity
          const gravityMultiplier = Math.abs(currentGravity / DEFAULT_GRAVITY);
          newPlayer.velocityY = -newPlayer.jumpPower * Math.sqrt(gravityMultiplier);
          newPlayer.isJumping = true;
          newPlayer.isGrounded = false;
          lastJumpTime.current = timestamp;
          sounds.jump();
        }
      }

      // Apply gravity
      newPlayer.velocityY += currentGravity;

      // Update position
      newPlayer.x += newPlayer.velocityX;
      newPlayer.y += newPlayer.velocityY;

      // Boundary check
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.x + newPlayer.width > CANVAS_WIDTH) newPlayer.x = CANVAS_WIDTH - newPlayer.width;

      // For anti-gravity, check ceiling
      if (currentGravity < 0) {
        if (newPlayer.y < 0) {
          newPlayer.y = 0;
          newPlayer.velocityY = 0;
          newPlayer.isGrounded = true;
        }
      }

      // Platform collision
      newPlayer.isGrounded = false;
      platformsRef.current.forEach(platform => {
        if (!platform.isVisible) return;

        // Shaking earth effect on player
        if (platform.type === 'shaking_earth' && platform.shakeIntensity) {
          const shake = Math.sin(timestamp * (platform.shakeFrequency || 0.1)) * platform.shakeIntensity;
          if (checkCollision(newPlayer, { ...platform, y: platform.y + shake })) {
            newPlayer.y += shake * 0.3;
            if (Math.random() < 0.05) sounds.shake();
          }
        }

        if (checkCollision(newPlayer, platform)) {
          // Deadly platforms
          if (platform.type === 'spike' || platform.type === 'lava') {
            handleDeath();
            return;
          }

          // Razor blades (instant death)
          if (platform.type === 'razor') {
            sounds.razor();
            handleDeath();
            return;
          }

          // Crushing platforms (instant death)
          if (platform.type === 'crushing') {
            sounds.crush();
            handleDeath();
            return;
          }

          // Fake platforms (fall through)
          if (platform.type === 'fake') {
            return;
          }

          // Disappearing platforms
          if (platform.type === 'disappearing') {
            if (!platform.touchCount) platform.touchCount = 0;
            platform.touchCount++;

            if (platform.touchCount === 1) {
              setTimeout(() => {
                platform.isVisible = false;
              }, platform.disappearDelay);
            }
          }

          // Landing on top (or bottom for anti-gravity)
          if (currentGravity >= 0) {
            // Normal gravity - land on top
            if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height - newPlayer.velocityY <= platform.y) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
              newPlayer.isGrounded = true;
              newPlayer.isJumping = false;
            }
            // Hitting from below
            else if (newPlayer.velocityY < 0 && newPlayer.y - newPlayer.velocityY >= platform.y + platform.height) {
              newPlayer.y = platform.y + platform.height;
              newPlayer.velocityY = 0;
            }
            // Side collision
            else {
              if (newPlayer.x < platform.x) {
                newPlayer.x = platform.x - newPlayer.width;
              } else {
                newPlayer.x = platform.x + platform.width;
              }
              newPlayer.velocityX = 0;
            }
          } else {
            // Anti-gravity - land on bottom
            if (newPlayer.velocityY < 0 && newPlayer.y - newPlayer.velocityY >= platform.y + platform.height) {
              newPlayer.y = platform.y + platform.height;
              newPlayer.velocityY = 0;
              newPlayer.isGrounded = true;
              newPlayer.isJumping = false;
            }
            // Hitting from above
            else if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height - newPlayer.velocityY <= platform.y) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
            }
            // Side collision
            else {
              if (newPlayer.x < platform.x) {
                newPlayer.x = platform.x - newPlayer.width;
              } else {
                newPlayer.x = platform.x + platform.width;
              }
              newPlayer.velocityX = 0;
            }
          }
        }
      });

      // Check exit collision
      const exit = level.exit;
      if (checkCollision(newPlayer, exit)) {
        if (exit.isFake) {
          setGameState(prev => ({
            ...prev,
            message: '😈 Gotcha! That was a fake exit!'
          }));
          setTimeout(() => {
            initLevel(exit.redirectLevel || 0);
          }, 1000);
          return;
        } else {
          setGameState(prev => ({
            ...prev,
            levelComplete: true,
            message: level.isBossLevel ? '👑 BOSS DEFEATED!' : '✨ Level Complete!'
          }));
          sounds.complete();
          return;
        }
      }

      // Check for real exit in levels with fake exits
      // @ts-ignore
      if (level.realExit && checkCollision(newPlayer, level.realExit)) {
        setGameState(prev => ({
          ...prev,
          levelComplete: true,
          message: '✨ Level Complete! You found the real exit!'
        }));
        sounds.complete();
        return;
      }

      // Fall death (both directions)
      if (currentGravity >= 0 && newPlayer.y > CANVAS_HEIGHT) {
        handleDeath();
        return;
      } else if (currentGravity < 0 && newPlayer.y + newPlayer.height < 0) {
        handleDeath();
        return;
      }

      // Send position update via WebSocket in real-time
      if (multiplayerMode && wsClientRef.current && wsClientRef.current.isConnected()) {
        wsClientRef.current.movePlayer(
          { x: newPlayer.x, y: newPlayer.y },
          newPlayer.direction
        );
      }

      setPlayer(newPlayer);

      // Apply screen shake for rendering
      ctx.save();
      ctx.translate(screenShakeX, screenShakeY);

      // Draw platforms
      platformsRef.current.forEach(platform => {
        if (!platform.isVisible) return;

        ctx.fillStyle = platform.color || '#4a5568';

        if (platform.type === 'razor') {
          // Draw spinning razor blades
          ctx.save();
          ctx.translate(platform.x + platform.width / 2, platform.y + platform.height / 2);
          ctx.rotate((platform.rotation || 0) * Math.PI / 180);

          // Blade circle
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, platform.width / 2, 0, Math.PI * 2);
          ctx.fill();

          // Razor teeth
          ctx.fillStyle = '#7f1d1d';
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * platform.width / 2, Math.sin(angle) * platform.height / 2);
            ctx.lineTo(Math.cos(angle + 0.3) * platform.width / 3, Math.sin(angle + 0.3) * platform.height / 3);
            ctx.closePath();
            ctx.fill();
          }

          // Center bolt
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(0, 0, platform.width / 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (platform.type === 'crushing') {
          // Draw crushing platforms with menacing appearance
          ctx.fillStyle = platform.color || '#7f1d1d';
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

          // Spikes on bottom
          ctx.fillStyle = '#450a0a';
          for (let i = 0; i < platform.width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y + platform.height);
            ctx.lineTo(platform.x + i + 7.5, platform.y + platform.height + 10);
            ctx.lineTo(platform.x + i + 15, platform.y + platform.height);
            ctx.closePath();
            ctx.fill();
          }
        } else if (platform.type === 'shaking_earth') {
          // Draw shaking ground with cracks
          const shake = Math.sin(timestamp * (platform.shakeFrequency || 0.1)) * (platform.shakeIntensity || 5);
          ctx.fillStyle = platform.color || '#78350f';
          ctx.fillRect(platform.x, platform.y + shake, platform.width, platform.height);

          // Draw cracks
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) {
            const crackX = platform.x + (platform.width / 5) * i + 20;
            ctx.beginPath();
            ctx.moveTo(crackX, platform.y + shake);
            ctx.lineTo(crackX + Math.random() * 20 - 10, platform.y + shake + 30);
            ctx.stroke();
          }
        } else if (platform.type === 'spike') {
          // Draw spikes
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#000';
          for (let i = 0; i < platform.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y + platform.height);
            ctx.lineTo(platform.x + i + 10, platform.y);
            ctx.lineTo(platform.x + i + 20, platform.y + platform.height);
            ctx.closePath();
            ctx.fill();
          }
        } else if (platform.type === 'disappearing') {
          // Flashing effect for disappearing platforms
          let opacity = 1;
          if (platform.touchCount && platform.touchCount > 0) {
            opacity = Math.sin(Date.now() / 100) * 0.3 + 0.7;
          }

          // Shake effect if specified
          let shakeY = 0;
          if (platform.shakeIntensity && platform.touchCount && platform.touchCount > 0) {
            shakeY = Math.sin(Date.now() * 0.02) * platform.shakeIntensity;
          }

          ctx.globalAlpha = opacity;
          ctx.fillRect(platform.x, platform.y + shakeY, platform.width, platform.height);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
      });

      // Draw exit
      ctx.fillStyle = exit.isFake ? '#f56565' : '#48bb78';
      ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', exit.x + exit.width / 2, exit.y + exit.height / 2 + 8);

      // Draw real exit if exists
      // @ts-ignore
      if (level.realExit) {
        // @ts-ignore
        const realExit = level.realExit;
        ctx.fillStyle = '#48bb78';
        ctx.fillRect(realExit.x, realExit.y, realExit.width, realExit.height);
        ctx.fillStyle = '#fff';
        ctx.fillText('EXIT', realExit.x + realExit.width / 2, realExit.y + realExit.height / 2 + 8);
      }

      // Draw other players (multiplayer) - real-time positions
      otherPlayers.forEach(otherPlayer => {
        ctx.fillStyle = otherPlayer.playerColor;
        ctx.fillRect(otherPlayer.positionX, otherPlayer.positionY, 30, 30);

        // Draw eyes
        ctx.fillStyle = '#000';
        if (otherPlayer.direction === 'right') {
          ctx.fillRect(otherPlayer.positionX + 18, otherPlayer.positionY + 8, 6, 6);
        } else {
          ctx.fillRect(otherPlayer.positionX + 6, otherPlayer.positionY + 8, 6, 6);
        }

        // Draw name label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(otherPlayer.playerName, otherPlayer.positionX + 15, otherPlayer.positionY - 5);
      });

      // Draw player
      ctx.fillStyle = roomData?.playerColor || '#f59e0b';
      ctx.fillRect(newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height);

      // Draw player eyes
      ctx.fillStyle = '#000';
      if (newPlayer.direction === 'right') {
        ctx.fillRect(newPlayer.x + 18, newPlayer.y + 8, 6, 6);
      } else {
        ctx.fillRect(newPlayer.x + 6, newPlayer.y + 8, 6, 6);
      }

      // Draw player name (multiplayer)
      if (multiplayerMode && roomData) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(roomData.playerName, newPlayer.x + 15, newPlayer.y - 5);
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.currentLevel, player, handleDeath, initLevel, otherPlayers, multiplayerMode, roomData]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();
      keysPressed.current.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const currentLevel = LEVELS[gameState.currentLevel];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Level Devil</h1>
        <p className="text-gray-300">Nothing is as it seems...</p>
      </div>

      {/* Multiplayer Info */}
      {multiplayerMode && roomData && (
        <div className="mb-4 bg-blue-900/40 backdrop-blur-sm rounded-lg p-3 max-w-[800px] w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Room: {roomData.code}</span>
              <Button onClick={copyRoomCode} variant="outline" size="sm" className="h-7">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
              <span className="text-gray-300 text-sm">{otherPlayers.length + 1} player{otherPlayers.length !== 0 ? 's' : ''}</span>
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} title={wsConnected ? 'Connected' : 'Disconnected'} />
            </div>
            <Button onClick={leaveRoom} variant="destructive" size="sm">
              Leave Room
            </Button>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[800px] bg-black/30 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Lives:</span>
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < gameState.lives ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            ))}
          </div>
          {gameState.isPlaying && (
            <div className="text-white font-semibold">
              Level {gameState.currentLevel + 1} / {LEVELS.length}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!multiplayerMode && !gameState.isPlaying && (
            <Button onClick={() => setShowMultiplayerSetup(true)} variant="secondary" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Multiplayer
            </Button>
          )}
          <Button onClick={resetLevel} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Level
          </Button>
          {gameState.isPlaying && gameState.currentLevel < LEVELS.length - 1 && (
            <Button onClick={skipLevel} variant="secondary" size="sm">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Level
            </Button>
          )}
          {gameState.currentLevel > 0 && (
            <Button onClick={resetProgress} variant="destructive" size="sm">
              <RotateCw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`border-4 rounded-lg shadow-2xl ${currentLevel?.isBossLevel ? 'border-red-600 animate-pulse' : 'border-purple-500'
            }`}
        />

        {/* Boss level indicator */}
        {gameState.isPlaying && currentLevel?.isBossLevel && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl animate-bounce shadow-lg">
            ⚠️ BOSS LEVEL ⚠️
          </div>
        )}

        {/* Multiplayer Setup Overlay */}
        {showMultiplayerSetup && !multiplayerMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Multiplayer Setup</h2>

              <div className="mb-6">
                <label className="text-white text-sm mb-2 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="mb-4"
                  maxLength={20}
                />
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={createRoom}
                  className="w-full"
                  size="lg"
                  disabled={!playerName.trim()}
                >
                  Create Room
                </Button>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="mb-2"
                  maxLength={6}
                />

                <Button
                  onClick={joinRoom}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  disabled={!playerName.trim() || !joinCode.trim()}
                >
                  Join Room
                </Button>
              </div>

              <Button
                onClick={() => setShowMultiplayerSetup(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Overlays */}
        {!gameState.isPlaying && !gameState.gameOver && !showMultiplayerSetup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {gameState.currentLevel > 0 ? `Continue from Level ${gameState.currentLevel + 1}?` : 'Ready to Start?'}
              </h2>
              <p className="text-gray-300 mb-6">Use Arrow Keys or WASD to move and jump</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Play className="w-5 h-5 mr-2" />
                  {gameState.currentLevel > 0 ? 'Continue' : 'Start Game'}
                </Button>
                {gameState.currentLevel > 0 && (
                  <Button onClick={resetProgress} size="lg" variant="outline">
                    <RotateCw className="w-5 h-5 mr-2" />
                    Start from Level 1
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {gameState.levelComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="text-center">
              <h2 className={`text-3xl font-bold mb-4 ${currentLevel?.isBossLevel ? 'text-yellow-400' : 'text-green-400'
                }`}>{gameState.message}</h2>
              {gameState.currentLevel < LEVELS.length - 1 ? (
                <Button onClick={nextLevel} size="lg" className="bg-green-600 hover:bg-green-700">
                  Next Level
                </Button>
              ) : (
                <div>
                  <p className="text-white mb-4">You beat all levels!</p>
                  <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-400 mb-4">{gameState.message}</h2>
              <Button onClick={startGame} size="lg" className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {gameState.message && gameState.isPlaying && !gameState.levelComplete && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold">
            {gameState.message}
          </div>
        )}
      </div>

      {/* Current Level Info */}
      {gameState.isPlaying && currentLevel && (
        <div className={`mt-4 text-center backdrop-blur-sm rounded-lg p-4 max-w-[800px] ${currentLevel.isBossLevel ? 'bg-red-900/40 border-2 border-red-500' : 'bg-black/30'
          }`}>
          <h3 className="text-xl font-bold text-white mb-2">{currentLevel.name}</h3>
          <p className={`italic ${currentLevel.isBossLevel ? 'text-red-300' : 'text-yellow-300'}`}>
            {currentLevel.trick}
          </p>
          {currentLevel.gravityZones && (
            <p className="text-purple-300 text-sm mt-2">
              🌪️ Gravity zones active! Purple = Anti-gravity, Red = Heavy gravity
            </p>
          )}
        </div>
      )}

      {/* Controls Info */}
      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>🎮 Controls: Arrow Keys or WASD to move • Space/W/Up to jump</p>
        {currentLevel?.isBossLevel && (
          <p className="text-red-400 font-bold mt-2">⚠️ EXTREME DIFFICULTY - GOOD LUCK! ⚠️</p>
        )}
        {multiplayerMode && (
          <p className="text-blue-400 font-bold mt-2">
            👥 Real-time WebSocket Multiplayer • {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        )}
      </div>
    </div>
  );
}