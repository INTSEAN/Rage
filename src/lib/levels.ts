import { Level } from './gameTypes';

export const LEVELS: Level[] = [
  // Level 1 - Tutorial (Easy)
  {
    id: 1,
    name: "Getting Started",
    backgroundColor: "#1a1a2e",
    startPosition: { x: 50, y: 400 },
    trick: "Simple introduction - but watch out!",
    platforms: [
      // Ground
      { x: 0, y: 500, width: 800, height: 100, type: 'normal', color: '#4a5568' },
      // Steps up
      { x: 200, y: 450, width: 100, height: 20, type: 'normal', color: '#4a5568' },
      { x: 350, y: 400, width: 100, height: 20, type: 'normal', color: '#4a5568' },
      { x: 500, y: 350, width: 100, height: 20, type: 'normal', color: '#4a5568' },
      // Fake platform (looks normal but disappears)
      { x: 650, y: 300, width: 100, height: 20, type: 'disappearing', color: '#4a5568', disappearDelay: 500 },
      // Real exit platform
      { x: 700, y: 200, width: 80, height: 20, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 710, y: 150, width: 60, height: 50 }
  },
  
  // Level 2 - Baby Steps (NEW)
  {
    id: 2,
    name: "Baby Steps",
    backgroundColor: "#1c1c30",
    startPosition: { x: 50, y: 400 },
    trick: "Watch where you step!",
    platforms: [
      // Ground with gap
      { x: 0, y: 500, width: 300, height: 100, type: 'normal', color: '#4a5568' },
      { x: 400, y: 500, width: 400, height: 100, type: 'normal', color: '#4a5568' },
      // Simple jump
      { x: 300, y: 450, width: 100, height: 20, type: 'normal', color: '#4a5568' },
      // Introduce spikes
      { x: 450, y: 490, width: 100, height: 10, type: 'spike', color: '#e53e3e' },
      // Upper platforms
      { x: 550, y: 400, width: 80, height: 20, type: 'normal', color: '#4a5568' },
      { x: 650, y: 300, width: 100, height: 20, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 670, y: 250, width: 60, height: 50 }
  },
  
  // Level 3 - BOSS 1: "RAZOR STORM"
  {
    id: 3,
    name: "⚔️ BOSS: RAZOR STORM ⚔️",
    backgroundColor: "#120a1f",
    startPosition: { x: 50, y: 450 },
    trick: "The blades are spinning... SURVIVE!",
    isBossLevel: true,
    bossMusic: true,
    platforms: [
      // Safe ground sections (limited)
      { x: 0, y: 500, width: 120, height: 100, type: 'normal', color: '#2d1b4e' },
      { x: 680, y: 500, width: 120, height: 100, type: 'normal', color: '#2d1b4e' },
      
      // SPINNING RAZORS (lethal circular blades)
      { x: 200, y: 400, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 8 },
      { x: 350, y: 350, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -10 },
      { x: 500, y: 400, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 12 },
      
      // Moving razors (extra danger)
      { x: 250, y: 250, width: 35, height: 35, type: 'razor', color: '#b91c1c', rotation: 0, rotationSpeed: 15, moveDirection: 'horizontal', moveSpeed: 3, moveRange: 200, startX: 250 },
      { x: 450, y: 200, width: 35, height: 35, type: 'razor', color: '#b91c1c', rotation: 0, rotationSpeed: -15, moveDirection: 'vertical', moveSpeed: 2, moveRange: 150, startY: 200 },
      
      // Fast moving platforms (must time carefully)
      { x: 150, y: 450, width: 70, height: 12, type: 'moving', color: '#7c3aed', moveDirection: 'horizontal', moveSpeed: 4, moveRange: 180, startX: 150 },
      { x: 350, y: 480, width: 70, height: 12, type: 'moving', color: '#7c3aed', moveDirection: 'horizontal', moveSpeed: -3.5, moveRange: 200, startX: 350 },
      { x: 550, y: 450, width: 70, height: 12, type: 'moving', color: '#7c3aed', moveDirection: 'horizontal', moveSpeed: 3.5, moveRange: 150, startX: 550 },
      
      // Upper escape route (very difficult)
      { x: 300, y: 150, width: 80, height: 15, type: 'disappearing', color: '#f59e0b', disappearDelay: 400 },
      { x: 420, y: 120, width: 80, height: 15, type: 'disappearing', color: '#f59e0b', disappearDelay: 400 },
      
      // Spikes on ground
      { x: 120, y: 490, width: 560, height: 10, type: 'spike', color: '#991b1b' },
      
      // Exit platform
      { x: 550, y: 80, width: 100, height: 20, type: 'normal', color: '#16a34a' },
    ],
    exit: { x: 570, y: 30, width: 60, height: 50 }
  },
  
  // Level 4 - Keep Moving
  {
    id: 4,
    name: "Keep Moving",
    backgroundColor: "#16213e",
    startPosition: { x: 50, y: 400 },
    trick: "Platforms that move... and one fake exit!",
    platforms: [
      // Ground
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#4a5568' },
      // Moving platforms
      { x: 200, y: 400, width: 80, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 150, startX: 200 },
      { x: 400, y: 350, width: 80, height: 15, type: 'moving', color: '#667eea', moveDirection: 'vertical', moveSpeed: 1.5, moveRange: 100, startY: 350 },
      { x: 550, y: 300, width: 80, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 100, startX: 550 },
      // Spikes
      { x: 300, y: 490, width: 150, height: 10, type: 'spike', color: '#e53e3e' },
      // Exit platforms
      { x: 650, y: 450, width: 80, height: 20, type: 'normal', color: '#4a5568' },
      { x: 700, y: 200, width: 80, height: 20, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 660, y: 400, width: 60, height: 50, isFake: true, redirectLevel: 1 },
  },
  
  // Level 5 - Vanishing Act Introduction
  {
    id: 5,
    name: "Vanishing Act",
    backgroundColor: "#14283a",
    startPosition: { x: 50, y: 450 },
    trick: "Don't stand still...",
    platforms: [
      // Ground
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#4a5568' },
      // Gentle introduction to disappearing platforms
      { x: 180, y: 450, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 1000 },
      { x: 290, y: 400, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      { x: 400, y: 380, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 900 },
      { x: 510, y: 340, width: 90, height: 15, type: 'normal', color: '#4a5568' },
      // Spikes below
      { x: 150, y: 490, width: 250, height: 10, type: 'spike', color: '#e53e3e' },
      // Exit platform
      { x: 640, y: 280, width: 100, height: 20, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 660, y: 230, width: 60, height: 50 }
  },
  
  // Level 6 - BOSS 2: "EARTH SHAKER"
  {
    id: 6,
    name: "🌋 BOSS: EARTH SHAKER 🌋",
    backgroundColor: "#1a0f0a",
    startPosition: { x: 50, y: 400 },
    trick: "The earth trembles... THE GROUND BETRAYS YOU!",
    isBossLevel: true,
    bossMusic: true,
    platforms: [
      // SHAKING EARTH (unstable ground that shakes violently)
      { x: 0, y: 500, width: 200, height: 100, type: 'shaking_earth', color: '#78350f', shakeIntensity: 8, shakeFrequency: 0.1 },
      { x: 300, y: 500, width: 200, height: 100, type: 'shaking_earth', color: '#78350f', shakeIntensity: 10, shakeFrequency: 0.15 },
      { x: 600, y: 500, width: 200, height: 100, type: 'shaking_earth', color: '#78350f', shakeIntensity: 12, shakeFrequency: 0.12 },
      
      // CRUSHING PLATFORMS (descend from ceiling to crush player)
      { x: 200, y: 50, width: 100, height: 30, type: 'crushing', color: '#7f1d1d', crushSpeed: 2, moveDirection: 'vertical', moveSpeed: 2, moveRange: 300, startY: 50 },
      { x: 500, y: 50, width: 100, height: 30, type: 'crushing', color: '#7f1d1d', crushSpeed: 2, moveDirection: 'vertical', moveSpeed: 2, moveRange: 280, startY: 50 },
      
      // RAZORS in the middle
      { x: 350, y: 380, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 20 },
      { x: 450, y: 340, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -18 },
      
      // Unstable disappearing platforms (shake while disappearing)
      { x: 150, y: 400, width: 70, height: 12, type: 'disappearing', color: '#ea580c', disappearDelay: 600, shakeIntensity: 5 },
      { x: 250, y: 350, width: 70, height: 12, type: 'disappearing', color: '#ea580c', disappearDelay: 500, shakeIntensity: 6 },
      { x: 380, y: 300, width: 70, height: 12, type: 'disappearing', color: '#ea580c', disappearDelay: 550, shakeIntensity: 7 },
      { x: 500, y: 250, width: 70, height: 12, type: 'disappearing', color: '#ea580c', disappearDelay: 500, shakeIntensity: 6 },
      { x: 620, y: 200, width: 80, height: 15, type: 'normal', color: '#16a34a' },
      
      // Lava everywhere
      { x: 200, y: 490, width: 100, height: 10, type: 'lava', color: '#ff4500' },
      { x: 500, y: 490, width: 100, height: 10, type: 'lava', color: '#ff4500' },
    ],
    exit: { x: 630, y: 150, width: 60, height: 50 }
  },
  
  // Level 7 - Mixed Troubles
  {
    id: 7,
    name: "Mixed Troubles",
    backgroundColor: "#132a3d",
    startPosition: { x: 50, y: 400 },
    trick: "Moving AND disappearing? This is trouble!",
    platforms: [
      // Ground sections
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#4a5568' },
      // Moving platform
      { x: 180, y: 420, width: 70, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 120, startX: 180 },
      // Disappearing platform
      { x: 350, y: 380, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 700 },
      // Another moving platform
      { x: 470, y: 320, width: 70, height: 15, type: 'moving', color: '#667eea', moveDirection: 'vertical', moveSpeed: 1.5, moveRange: 90, startY: 320 },
      // Disappearing again
      { x: 580, y: 260, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 600 },
      // Lava below
      { x: 150, y: 490, width: 500, height: 10, type: 'lava', color: '#fc8181' },
      // Exit platform
      { x: 690, y: 200, width: 90, height: 20, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 705, y: 150, width: 60, height: 50 }
  },
  
  // Level 8 - Trust Issues
  {
    id: 8,
    name: "Trust Issues",
    backgroundColor: "#1e1e2e",
    startPosition: { x: 50, y: 400 },
    trick: "Which exit is real? Choose wisely!",
    platforms: [
      // Ground sections
      { x: 0, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      { x: 600, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      // Middle section with spikes
      { x: 200, y: 490, width: 400, height: 10, type: 'spike', color: '#e53e3e' },
      // Moving platforms over spikes
      { x: 250, y: 400, width: 60, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 200, startX: 250 },
      { x: 450, y: 350, width: 60, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: -3, moveRange: 200, startX: 450 },
      // Upper platforms
      { x: 100, y: 300, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      { x: 300, y: 250, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 600 },
      { x: 500, y: 200, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      { x: 680, y: 250, width: 80, height: 15, type: 'normal', color: '#4a5568' },
    ],
    exit: { x: 110, y: 250, width: 60, height: 50, isFake: true, redirectLevel: 1 },
  },
  
  // Level 9 - BOSS 3: "DEVIL'S WRATH"
  {
    id: 9,
    name: "😈 FINAL BOSS: DEVIL'S WRATH 😈",
    backgroundColor: "#050505",
    startPosition: { x: 50, y: 450 },
    trick: "ALL HELL BREAKS LOOSE! SHOW NO MERCY!",
    isBossLevel: true,
    bossMusic: true,
    platforms: [
      // EVERYTHING COMBINED - ULTIMATE CHAOS
      
      // Shaking unstable ground
      { x: 0, y: 500, width: 120, height: 100, type: 'shaking_earth', color: '#450a0a', shakeIntensity: 15, shakeFrequency: 0.2 },
      { x: 680, y: 500, width: 120, height: 100, type: 'shaking_earth', color: '#450a0a', shakeIntensity: 15, shakeFrequency: 0.2 },
      
      // Lava pit in middle
      { x: 120, y: 490, width: 560, height: 10, type: 'lava', color: '#ff0000' },
      
      // MULTIPLE CRUSHING PLATFORMS
      { x: 150, y: 30, width: 80, height: 25, type: 'crushing', color: '#7f1d1d', moveDirection: 'vertical', moveSpeed: 3, moveRange: 350, startY: 30 },
      { x: 350, y: 30, width: 80, height: 25, type: 'crushing', color: '#7f1d1d', moveDirection: 'vertical', moveSpeed: 2.5, moveRange: 330, startY: 30 },
      { x: 550, y: 30, width: 80, height: 25, type: 'crushing', color: '#7f1d1d', moveDirection: 'vertical', moveSpeed: 3.5, moveRange: 360, startY: 30 },
      
      // SPINNING RAZORS EVERYWHERE
      { x: 200, y: 420, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 25 },
      { x: 400, y: 380, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -22 },
      { x: 600, y: 420, width: 40, height: 40, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 28 },
      
      // Moving razors for extra chaos
      { x: 250, y: 300, width: 35, height: 35, type: 'razor', color: '#991b1b', rotation: 0, rotationSpeed: 30, moveDirection: 'horizontal', moveSpeed: 4, moveRange: 250, startX: 250 },
      { x: 500, y: 250, width: 35, height: 35, type: 'razor', color: '#991b1b', rotation: 0, rotationSpeed: -28, moveDirection: 'vertical', moveSpeed: 3, moveRange: 180, startY: 250 },
      
      // Fast disappearing platforms (ultra short delay)
      { x: 140, y: 450, width: 60, height: 10, type: 'disappearing', color: '#dc2626', disappearDelay: 300, shakeIntensity: 8 },
      { x: 230, y: 400, width: 60, height: 10, type: 'disappearing', color: '#dc2626', disappearDelay: 350, shakeIntensity: 9 },
      { x: 320, y: 350, width: 60, height: 10, type: 'disappearing', color: '#dc2626', disappearDelay: 300, shakeIntensity: 8 },
      { x: 410, y: 300, width: 60, height: 10, type: 'disappearing', color: '#dc2626', disappearDelay: 350, shakeIntensity: 9 },
      { x: 500, y: 250, width: 60, height: 10, type: 'disappearing', color: '#dc2626', disappearDelay: 300, shakeIntensity: 8 },
      { x: 590, y: 200, width: 70, height: 12, type: 'disappearing', color: '#dc2626', disappearDelay: 400, shakeIntensity: 7 },
      
      // Final platform to exit
      { x: 680, y: 150, width: 100, height: 20, type: 'normal', color: '#16a34a' },
    ],
    exit: { x: 700, y: 100, width: 60, height: 50 }
  },
  
  // Level 10 - Devil's Playground
  {
    id: 10,
    name: "Devil's Playground",
    backgroundColor: "#0d1117",
    startPosition: { x: 50, y: 450 },
    trick: "The ultimate test... can you survive?",
    platforms: [
      // Ground
      { x: 0, y: 500, width: 800, height: 100, type: 'lava', color: '#fc8181' },
      // Safe starting platform
      { x: 0, y: 450, width: 120, height: 15, type: 'normal', color: '#4a5568' },
      // Complex path
      { x: 150, y: 400, width: 60, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 500 },
      { x: 240, y: 350, width: 70, height: 15, type: 'moving', color: '#667eea', moveDirection: 'vertical', moveSpeed: 2, moveRange: 80, startY: 350 },
      { x: 340, y: 300, width: 60, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 400 },
      { x: 430, y: 250, width: 70, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 100, startX: 430 },
      { x: 560, y: 200, width: 60, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 600 },
      { x: 650, y: 150, width: 80, height: 15, type: 'normal', color: '#48bb78' },
      // Fake platform near exit
      { x: 700, y: 100, width: 80, height: 15, type: 'fake', color: '#fc8181' },
      // Real exit platform (hidden higher)
      { x: 680, y: 50, width: 100, height: 15, type: 'normal', color: '#48bb78' },
    ],
    exit: { x: 700, y: 0, width: 60, height: 50 }
  },

  // Level 11 - Low Gravity Introduction
  {
    id: 11,
    name: "Floating World",
    backgroundColor: "#0a0e1a",
    startPosition: { x: 50, y: 450 },
    trick: "Everything feels... lighter?",
    gravity: 0.3, // Reduced gravity
    platforms: [
      // Ground
      { x: 0, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      { x: 600, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      
      // Wide gaps you can float across
      { x: 250, y: 420, width: 60, height: 15, type: 'normal', color: '#667eea' },
      { x: 380, y: 380, width: 60, height: 15, type: 'normal', color: '#667eea' },
      { x: 510, y: 340, width: 70, height: 15, type: 'normal', color: '#667eea' },
      
      // High platforms
      { x: 150, y: 200, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      { x: 350, y: 150, width: 100, height: 15, type: 'normal', color: '#4a5568' },
      { x: 550, y: 100, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      
      // Spikes to avoid
      { x: 200, y: 490, width: 400, height: 10, type: 'spike', color: '#e53e3e' },
      
      // Exit platform
      { x: 650, y: 50, width: 100, height: 15, type: 'normal', color: '#48bb78' },
    ],
    exit: { x: 670, y: 0, width: 60, height: 50 }
  },

  // Level 12 - BOSS 4: "GRAVITY STORM"
  {
    id: 12,
    name: "🌪️ BOSS: GRAVITY STORM 🌪️",
    backgroundColor: "#050a15",
    startPosition: { x: 50, y: 450 },
    trick: "GRAVITY ZONES AHEAD! UP IS DOWN, DOWN IS UP!",
    isBossLevel: true,
    bossMusic: true,
    gravityZones: [
      // Anti-gravity zone (floats upward)
      { x: 200, y: 0, width: 150, height: 600, gravity: -0.4, color: 'rgba(147, 51, 234, 0.2)' },
      // Super gravity zone (heavy fall)
      { x: 450, y: 0, width: 150, height: 600, gravity: 1.2, color: 'rgba(239, 68, 68, 0.2)' },
    ],
    platforms: [
      // Ground sections
      { x: 0, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      { x: 600, y: 500, width: 200, height: 100, type: 'normal', color: '#4a5568' },
      
      // Anti-gravity zone platforms
      { x: 210, y: 450, width: 70, height: 12, type: 'moving', color: '#a855f7', moveDirection: 'vertical', moveSpeed: 2, moveRange: 100, startY: 450 },
      { x: 260, y: 350, width: 60, height: 12, type: 'disappearing', color: '#a855f7', disappearDelay: 500 },
      { x: 220, y: 200, width: 80, height: 15, type: 'normal', color: '#8b5cf6' },
      
      // Super gravity zone platforms
      { x: 460, y: 450, width: 70, height: 12, type: 'moving', color: '#ef4444', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 80, startX: 460 },
      { x: 480, y: 350, width: 60, height: 12, type: 'disappearing', color: '#ef4444', disappearDelay: 400 },
      { x: 470, y: 250, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      
      // Razors in zones
      { x: 240, y: 300, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 15 },
      { x: 500, y: 400, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -20 },
      
      // Normal zone platforms
      { x: 360, y: 400, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      { x: 380, y: 250, width: 60, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 500 },
      
      // Spikes on ground
      { x: 200, y: 490, width: 400, height: 10, type: 'spike', color: '#991b1b' },
      
      // Ceiling spikes for anti-gravity
      { x: 200, y: 0, width: 150, height: 10, type: 'spike', color: '#991b1b' },
      
      // Exit platform
      { x: 650, y: 150, width: 100, height: 20, type: 'normal', color: '#16a34a' },
    ],
    exit: { x: 670, y: 100, width: 60, height: 50 }
  },

  // Level 13 - Gravity Maze
  {
    id: 13,
    name: "Gravity Maze",
    backgroundColor: "#0f0520",
    startPosition: { x: 50, y: 450 },
    trick: "Navigate the changing gravity fields!",
    gravityZones: [
      { x: 150, y: 300, width: 120, height: 200, gravity: -0.35, color: 'rgba(147, 51, 234, 0.15)' },
      { x: 350, y: 100, width: 100, height: 400, gravity: 0.9, color: 'rgba(239, 68, 68, 0.15)' },
      { x: 550, y: 200, width: 150, height: 300, gravity: -0.5, color: 'rgba(147, 51, 234, 0.2)' },
    ],
    platforms: [
      // Ground
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#4a5568' },
      
      // Zone 1 (anti-gravity)
      { x: 160, y: 480, width: 100, height: 15, type: 'normal', color: '#8b5cf6' },
      { x: 170, y: 380, width: 80, height: 12, type: 'disappearing', color: '#a855f7', disappearDelay: 600 },
      { x: 180, y: 320, width: 90, height: 15, type: 'normal', color: '#8b5cf6' },
      
      // Zone 2 (heavy gravity)
      { x: 360, y: 450, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      { x: 370, y: 350, width: 70, height: 12, type: 'moving', color: '#ef4444', moveDirection: 'vertical', moveSpeed: 2, moveRange: 80, startY: 350 },
      { x: 365, y: 200, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      { x: 375, y: 120, width: 60, height: 12, type: 'disappearing', color: '#ef4444', disappearDelay: 500 },
      
      // Zone 3 (strong anti-gravity)
      { x: 560, y: 480, width: 130, height: 15, type: 'normal', color: '#8b5cf6' },
      { x: 580, y: 380, width: 90, height: 12, type: 'moving', color: '#a855f7', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 60, startX: 580 },
      { x: 570, y: 250, width: 100, height: 15, type: 'normal', color: '#8b5cf6' },
      
      // Connecting platforms
      { x: 280, y: 400, width: 60, height: 15, type: 'normal', color: '#4a5568' },
      { x: 460, y: 350, width: 80, height: 15, type: 'normal', color: '#4a5568' },
      
      // Hazards
      { x: 300, y: 490, width: 50, height: 10, type: 'spike', color: '#e53e3e' },
      { x: 500, y: 490, width: 50, height: 10, type: 'lava', color: '#ff4500' },
      
      // Exit
      { x: 620, y: 220, width: 80, height: 15, type: 'normal', color: '#48bb78' },
    ],
    exit: { x: 635, y: 170, width: 60, height: 50 }
  },

  // Level 14 - Inverse World
  {
    id: 14,
    name: "Inverse World",
    backgroundColor: "#1a0a2e",
    startPosition: { x: 50, y: 450 },
    trick: "What goes up... stays up?",
    gravity: 0.25,
    gravityZones: [
      // Entire upper half has reverse gravity
      { x: 0, y: 0, width: 800, height: 300, gravity: -0.6, color: 'rgba(124, 58, 237, 0.15)' },
    ],
    platforms: [
      // Bottom section (low gravity)
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#4a5568' },
      { x: 180, y: 450, width: 80, height: 15, type: 'disappearing', color: '#f6ad55', disappearDelay: 700 },
      { x: 290, y: 400, width: 90, height: 15, type: 'normal', color: '#4a5568' },
      
      // Transition zone
      { x: 400, y: 320, width: 100, height: 15, type: 'moving', color: '#667eea', moveDirection: 'horizontal', moveSpeed: 2, moveRange: 120, startX: 400 },
      
      // Top section (reverse gravity - ceiling becomes floor)
      { x: 550, y: 280, width: 80, height: 15, type: 'normal', color: '#7c3aed' },
      { x: 450, y: 200, width: 70, height: 12, type: 'disappearing', color: '#a855f7', disappearDelay: 600 },
      { x: 350, y: 120, width: 90, height: 15, type: 'normal', color: '#7c3aed' },
      { x: 550, y: 80, width: 80, height: 15, type: 'moving', color: '#8b5cf6', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 100, startX: 550 },
      
      // Ceiling platforms (walk on ceiling in anti-gravity zone)
      { x: 150, y: 0, width: 200, height: 20, type: 'normal', color: '#7c3aed' },
      { x: 450, y: 0, width: 150, height: 20, type: 'normal', color: '#7c3aed' },
      
      // Razors in transition
      { x: 420, y: 280, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 18 },
      
      // Spikes
      { x: 150, y: 490, width: 250, height: 10, type: 'spike', color: '#e53e3e' },
      
      // Exit on ceiling
      { x: 680, y: 20, width: 100, height: 15, type: 'normal', color: '#48bb78' },
    ],
    exit: { x: 700, y: 70, width: 60, height: 50 }
  },

  // Level 15 - FINAL BOSS: "GRAVITY APOCALYPSE"
  {
    id: 15,
    name: "💀 FINAL BOSS: GRAVITY APOCALYPSE 💀",
    backgroundColor: "#000000",
    startPosition: { x: 50, y: 450 },
    trick: "THE ULTIMATE CHALLENGE! GRAVITY IS YOUR ENEMY!",
    isBossLevel: true,
    bossMusic: true,
    gravity: 0.4,
    gravityZones: [
      // Multiple chaotic gravity zones
      { x: 150, y: 0, width: 120, height: 600, gravity: -0.7, color: 'rgba(147, 51, 234, 0.25)' },
      { x: 320, y: 0, width: 100, height: 600, gravity: 1.5, color: 'rgba(239, 68, 68, 0.3)' },
      { x: 480, y: 0, width: 120, height: 600, gravity: -0.8, color: 'rgba(147, 51, 234, 0.3)' },
      { x: 650, y: 0, width: 100, height: 600, gravity: 1.3, color: 'rgba(239, 68, 68, 0.25)' },
    ],
    platforms: [
      // Safe zones (edges only)
      { x: 0, y: 500, width: 150, height: 100, type: 'normal', color: '#1f1f1f' },
      
      // Anti-gravity zone 1
      { x: 160, y: 480, width: 100, height: 12, type: 'moving', color: '#a855f7', moveDirection: 'vertical', moveSpeed: 3, moveRange: 150, startY: 480 },
      { x: 170, y: 350, width: 80, height: 10, type: 'disappearing', color: '#a855f7', disappearDelay: 300, shakeIntensity: 5 },
      { x: 180, y: 200, width: 70, height: 12, type: 'moving', color: '#8b5cf6', moveDirection: 'horizontal', moveSpeed: 2.5, moveRange: 80, startX: 180 },
      { x: 175, y: 50, width: 80, height: 15, type: 'normal', color: '#7c3aed' },
      
      // Heavy gravity zone 1 (crushing + razors)
      { x: 330, y: 450, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      { x: 340, y: 350, width: 70, height: 10, type: 'disappearing', color: '#ef4444', disappearDelay: 250 },
      { x: 335, y: 250, width: 80, height: 12, type: 'moving', color: '#ef4444', moveDirection: 'vertical', moveSpeed: 3.5, moveRange: 120, startY: 250 },
      { x: 330, y: 120, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      
      // Anti-gravity zone 2
      { x: 490, y: 480, width: 100, height: 12, type: 'moving', color: '#a855f7', moveDirection: 'horizontal', moveSpeed: 3, moveRange: 100, startX: 490 },
      { x: 500, y: 380, width: 80, height: 10, type: 'disappearing', color: '#a855f7', disappearDelay: 350, shakeIntensity: 6 },
      { x: 510, y: 250, width: 70, height: 12, type: 'moving', color: '#8b5cf6', moveDirection: 'vertical', moveSpeed: 2.5, moveRange: 100, startY: 250 },
      { x: 505, y: 100, width: 80, height: 15, type: 'normal', color: '#7c3aed' },
      
      // Heavy gravity zone 2
      { x: 660, y: 450, width: 80, height: 15, type: 'normal', color: '#dc2626' },
      { x: 670, y: 350, width: 70, height: 10, type: 'disappearing', color: '#ef4444', disappearDelay: 300 },
      { x: 665, y: 220, width: 80, height: 12, type: 'moving', color: '#ef4444', moveDirection: 'vertical', moveSpeed: 3, moveRange: 100, startY: 220 },
      
      // Razors EVERYWHERE
      { x: 200, y: 420, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 30, moveDirection: 'vertical', moveSpeed: 3, moveRange: 200, startY: 420 },
      { x: 360, y: 380, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -28 },
      { x: 520, y: 340, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: 32, moveDirection: 'horizontal', moveSpeed: 3, moveRange: 150, startX: 520 },
      { x: 690, y: 300, width: 35, height: 35, type: 'razor', color: '#dc2626', rotation: 0, rotationSpeed: -30 },
      { x: 240, y: 180, width: 35, height: 35, type: 'razor', color: '#991b1b', rotation: 0, rotationSpeed: 25 },
      { x: 450, y: 150, width: 35, height: 35, type: 'razor', color: '#991b1b', rotation: 0, rotationSpeed: -27 },
      
      // Crushing platforms
      { x: 280, y: 0, width: 80, height: 30, type: 'crushing', color: '#7f1d1d', moveDirection: 'vertical', moveSpeed: 4, moveRange: 400, startY: 0 },
      { x: 600, y: 0, width: 80, height: 30, type: 'crushing', color: '#7f1d1d', moveDirection: 'vertical', moveSpeed: 3.5, moveRange: 380, startY: 0 },
      
      // Lava everywhere
      { x: 150, y: 490, width: 120, height: 10, type: 'lava', color: '#ff0000' },
      { x: 320, y: 490, width: 100, height: 10, type: 'lava', color: '#ff0000' },
      { x: 480, y: 490, width: 120, height: 10, type: 'lava', color: '#ff0000' },
      { x: 650, y: 490, width: 100, height: 10, type: 'lava', color: '#ff0000' },
      
      // Ceiling spikes
      { x: 150, y: 0, width: 120, height: 10, type: 'spike', color: '#991b1b' },
      { x: 480, y: 0, width: 120, height: 10, type: 'spike', color: '#991b1b' },
      
      // Final exit platform (tiny, hard to reach)
      { x: 720, y: 150, width: 70, height: 15, type: 'normal', color: '#16a34a' },
    ],
    exit: { x: 730, y: 100, width: 60, height: 50 }
  }
];

// Add real exit to level 4
LEVELS[3].platforms.push({ x: 710, y: 150, width: 80, height: 20, type: 'normal', color: '#48bb78' });
// @ts-ignore
LEVELS[3].realExit = { x: 720, y: 100, width: 60, height: 50 };

// Add real exit to level 8
LEVELS[7].platforms.push({ x: 690, y: 200, width: 80, height: 20, type: 'normal', color: '#48bb78' });
// @ts-ignore
LEVELS[7].realExit = { x: 700, y: 150, width: 60, height: 50 };