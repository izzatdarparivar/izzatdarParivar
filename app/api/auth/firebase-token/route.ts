import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate custom token for the authenticated Clerk user
    const firebaseToken = await adminAuth.createCustomToken(userId);

    return NextResponse.json({ token: firebaseToken });
  } catch (error) {
    console.error('Error generating custom token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
