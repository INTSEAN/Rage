import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const gameRooms = sqliteTable('game_rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  hostName: text('host_name').notNull(),
  maxPlayers: integer('max_players').notNull().default(8),
  currentLevel: integer('current_level').notNull().default(0),
  createdAt: text('created_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const roomPlayers = sqliteTable('room_players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => gameRooms.id),
  playerName: text('player_name').notNull(),
  playerColor: text('player_color').notNull(),
  positionX: real('position_x').notNull().default(0),
  positionY: real('position_y').notNull().default(0),
  direction: text('direction').notNull().default('right'),
  lastUpdated: text('last_updated').notNull(),
  joinedAt: text('joined_at').notNull(),
});