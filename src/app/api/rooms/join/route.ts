import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRooms, roomPlayers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const COLOR_PALETTE = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52B788'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, playerName } = body;

    // Validation: Check required fields
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { error: 'Room code is required', code: 'MISSING_ROOM_CODE' },
        { status: 400 }
      );
    }

    if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
      return NextResponse.json(
        { error: 'Player name is required', code: 'MISSING_PLAYER_NAME' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedCode = code.trim();
    const sanitizedPlayerName = playerName.trim();

    // Find room by code
    const room = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.code, sanitizedCode))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const gameRoom = room[0];

    // Check if room is active
    if (!gameRoom.isActive) {
      return NextResponse.json(
        { error: 'Room is not active', code: 'ROOM_INACTIVE' },
        { status: 404 }
      );
    }

    // Count current players in the room
    const currentPlayers = await db
      .select()
      .from(roomPlayers)
      .where(eq(roomPlayers.roomId, gameRoom.id));

    if (currentPlayers.length >= gameRoom.maxPlayers) {
      return NextResponse.json(
        { error: 'Room is full', code: 'ROOM_FULL' },
        { status: 400 }
      );
    }

    // Assign random color from palette
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    // Get current timestamp
    const now = new Date().toISOString();

    // Insert new player
    const newPlayer = await db
      .insert(roomPlayers)
      .values({
        roomId: gameRoom.id,
        playerName: sanitizedPlayerName,
        playerColor: randomColor,
        positionX: 100,
        positionY: 400,
        direction: 'right',
        joinedAt: now,
        lastUpdated: now,
      })
      .returning();

    if (newPlayer.length === 0) {
      return NextResponse.json(
        { error: 'Failed to join room', code: 'JOIN_FAILED' },
        { status: 500 }
      );
    }

    // Fetch all players in the room
    const allPlayers = await db
      .select()
      .from(roomPlayers)
      .where(eq(roomPlayers.roomId, gameRoom.id));

    return NextResponse.json(
      {
        roomId: gameRoom.id,
        playerId: newPlayer[0].id,
        playerColor: newPlayer[0].playerColor,
        players: allPlayers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}