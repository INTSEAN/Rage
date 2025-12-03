import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roomPlayers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
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

    const body = await request.json();
    const { playerId, x, y, direction } = body;

    // Validate required fields
    if (playerId === undefined || playerId === null) {
      return NextResponse.json(
        { error: 'playerId is required', code: 'MISSING_PLAYER_ID' },
        { status: 400 }
      );
    }

    if (x === undefined || x === null) {
      return NextResponse.json(
        { error: 'x coordinate is required', code: 'MISSING_X_COORDINATE' },
        { status: 400 }
      );
    }

    if (y === undefined || y === null) {
      return NextResponse.json(
        { error: 'y coordinate is required', code: 'MISSING_Y_COORDINATE' },
        { status: 400 }
      );
    }

    if (!direction) {
      return NextResponse.json(
        { error: 'direction is required', code: 'MISSING_DIRECTION' },
        { status: 400 }
      );
    }

    // Validate direction value
    if (direction !== 'left' && direction !== 'right') {
      return NextResponse.json(
        { error: 'direction must be either "left" or "right"', code: 'INVALID_DIRECTION' },
        { status: 400 }
      );
    }

    // Validate playerId is a valid number
    const playerIdNum = parseInt(playerId);
    if (isNaN(playerIdNum)) {
      return NextResponse.json(
        { error: 'playerId must be a valid number', code: 'INVALID_PLAYER_ID' },
        { status: 400 }
      );
    }

    // Validate x and y are valid numbers
    const xNum = parseFloat(x);
    const yNum = parseFloat(y);
    
    if (isNaN(xNum)) {
      return NextResponse.json(
        { error: 'x must be a valid number', code: 'INVALID_X_COORDINATE' },
        { status: 400 }
      );
    }

    if (isNaN(yNum)) {
      return NextResponse.json(
        { error: 'y must be a valid number', code: 'INVALID_Y_COORDINATE' },
        { status: 400 }
      );
    }

    // Update player position
    const updated = await db
      .update(roomPlayers)
      .set({
        positionX: xNum,
        positionY: yNum,
        direction: direction,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(roomPlayers.id, playerIdNum))
      .returning();

    // Check if player was found and updated
    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Player not found', code: 'PLAYER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}