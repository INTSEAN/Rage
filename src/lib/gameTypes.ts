export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  jumpPower: number;
  isJumping: boolean;
  isGrounded: boolean;
  direction: 'left' | 'right';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'moving' | 'disappearing' | 'fake' | 'spike' | 'lava' | 'razor' | 'crushing' | 'shaking_earth';
  color?: string;
  moveDirection?: 'horizontal' | 'vertical';
  moveSpeed?: number;
  moveRange?: number;
  startX?: number;
  startY?: number;
  disappearDelay?: number;
  isVisible?: boolean;
  touchCount?: number;
  rotation?: number;
  rotationSpeed?: number;
  crushSpeed?: number;
  shakeIntensity?: number;
  shakeFrequency?: number;
}

export interface Exit {
  x: number;
  y: number;
  width: number;
  height: number;
  isFake?: boolean;
  redirectLevel?: number;
}

export interface Level {
  id: number;
  name: string;
  platforms: Platform[];
  exit: Exit;
  startPosition: { x: number; y: number };
  backgroundColor: string;
  trick?: string;
  isBossLevel?: boolean;
  bossMusic?: boolean;
  gravity?: number;
  gravityZones?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    gravity: number;
    color?: string;
  }>;
}

export interface GameState {
  currentLevel: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  message: string;
}

export interface MultiplayerPlayer {
  id: number;
  playerName: string;
  positionX: number;
  positionY: number;
  direction: 'left' | 'right';
  playerColor: string;
}

export interface RoomData {
  code: string;
  roomId: number;
  playerId: number;
  playerName: string;
  playerColor: string;
  isHost: boolean;
}