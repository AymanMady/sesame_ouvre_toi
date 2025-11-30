import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoiceProcessor } from '@/lib/VoiceProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, voiceprint } = body;

    // Validate input
    if (!email || !voiceprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse stored voiceprint
    const storedVoiceprint = JSON.parse(user.voiceprint);
    const providedVoiceprint = JSON.parse(voiceprint);

    // Compute cosine similarity
    const similarity = VoiceProcessor.cosineSimilarity(
      storedVoiceprint,
      providedVoiceprint
    );

    console.log('Voice similarity score:', similarity);

    // Check if similarity meets threshold
    const THRESHOLD = 0.85;
    if (similarity >= THRESHOLD) {
      return NextResponse.json({
        success: true,
        userId: user.id,
        email: user.email,
        similarity,
      });
    } else {
      return NextResponse.json(
        {
          error: 'Voice authentication failed',
          similarity,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate user' },
      { status: 500 }
    );
  }
}

