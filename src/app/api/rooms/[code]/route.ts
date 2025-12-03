import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRooms, roomPlayers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    if (!code) {
      return NextResponse.json(
        { error: 'Room code is required', code: 'MISSING_ROOM_CODE' },
        { status: 400 }
      );
    }

    const room = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.code, code))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const players = await db
      .select()
      .from(roomPlayers)
      .where(eq(roomPlayers.roomId, room[0].id));

    return NextResponse.json({
      room: room[0],
      players: players,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}