import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameRooms } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Generate random 6-character room code
function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Check if room code exists
async function isCodeUnique(code: string): Promise<boolean> {
  const existing = await db.select()
    .from(gameRooms)
    .where(eq(gameRooms.code, code))
    .limit(1);
  return existing.length === 0;
}

// Generate unique room code
async function generateUniqueRoomCode(): Promise<string> {
  let code = generateRoomCode();
  let attempts = 0;
  const maxAttempts = 100;

  while (!(await isCodeUnique(code)) && attempts < maxAttempts) {
    code = generateRoomCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique room code');
  }

  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostName } = body;

    // Validate required field
    if (!hostName || typeof hostName !== 'string' || hostName.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Host name is required and must be a non-empty string',
          code: 'MISSING_REQUIRED_FIELD'
        },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedHostName = hostName.trim();

    // Generate unique room code
    let roomCode: string;
    try {
      roomCode = await generateUniqueRoomCode();
    } catch (error) {
      console.error('Room code generation error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate unique room code. Please try again.',
          code: 'CODE_GENERATION_FAILED'
        },
        { status: 500 }
      );
    }

    // Create new game room
    const newRoom = await db.insert(gameRooms)
      .values({
        code: roomCode,
        hostName: sanitizedHostName,
        maxPlayers: 8,
        currentLevel: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
      })
      .returning();

    if (newRoom.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to create game room',
          code: 'CREATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        code: newRoom[0].code,
        roomId: newRoom[0].id,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}