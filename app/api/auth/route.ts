import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyPassword, AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { SafeUser } from '@/types/complaint';

export async function GET() {
  const user = getCurrentUser();
  if (user) {
    return NextResponse.json({ authenticated: true, user });
  }
  return NextResponse.json({ authenticated: false, user: null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Please provide both username and password.' },
        { status: 400 }
      );
    }

    // Look up user in DB
    const user = await db.getUserByUsername(cleanUsername);

    if (user && verifyPassword(cleanPassword, user.passwordHash, user.salt)) {
      const safeUser: SafeUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt
      };

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        user: safeUser
      });

      const sessionToken = Buffer.from(JSON.stringify(safeUser)).toString('base64');

      response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      return response;
    }

    // Fallback check for default admin if DB user was somehow missing
    if (cleanUsername.toLowerCase() === 'admin' && cleanPassword === (process.env.APP_PASSWORD || 'admin123')) {
      const safeUser: SafeUser = {
        id: 'u-admin',
        username: 'admin',
        name: 'Team Admin',
        createdAt: new Date().toISOString()
      };

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        user: safeUser
      });

      const sessionToken = Buffer.from(JSON.stringify(safeUser)).toString('base64');
      response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid username or password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication error: ' + String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
