import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRooms, roomPlayers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
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

    // Get playerId from URL search params instead of body
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required', code: 'MISSING_PLAYER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(playerId))) {
      return NextResponse.json(
        { error: 'Valid player ID is required', code: 'INVALID_PLAYER_ID' },
        { status: 400 }
      );
    }

    const existingPlayer = await db
      .select()
      .from(roomPlayers)
      .where(eq(roomPlayers.id, parseInt(playerId)))
      .limit(1);

    if (existingPlayer.length === 0) {
      return NextResponse.json(
        { error: 'Player not found', code: 'PLAYER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const player = existingPlayer[0];
    const playerName = player.playerName;

    await db.delete(roomPlayers).where(eq(roomPlayers.id, parseInt(playerId)));

    const room = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.code, code))
      .limit(1);

    if (room.length > 0 && room[0].hostName === playerName) {
      await db
        .update(gameRooms)
        .set({ isActive: false })
        .where(eq(gameRooms.code, code));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}