import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRooms } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    // Validate code parameter
    if (!code) {
      return NextResponse.json(
        { error: 'Room code is required', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { level } = body;

    // Validate required fields
    if (level === undefined || level === null) {
      return NextResponse.json(
        { error: 'Level is required', code: 'MISSING_LEVEL' },
        { status: 400 }
      );
    }

    // Validate level is a non-negative integer
    const levelNum = parseInt(level);
    if (isNaN(levelNum) || levelNum < 0 || !Number.isInteger(Number(level))) {
      return NextResponse.json(
        { 
          error: 'Level must be a non-negative integer', 
          code: 'INVALID_LEVEL' 
        },
        { status: 400 }
      );
    }

    // Find room by code
    const room = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.code, code))
      .limit(1);

    // Check if room exists
    if (room.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update room's current level (any player can advance the team)
    await db
      .update(gameRooms)
      .set({ currentLevel: levelNum })
      .where(eq(gameRooms.code, code));

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('POST level error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}