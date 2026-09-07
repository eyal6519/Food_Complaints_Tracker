import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DEFAULT_PASSCODE = process.env.APP_PASSWORD || 'admin123';
const AUTH_COOKIE_NAME = 'complaint_app_session';
const AUTH_TOKEN_VALUE = 'authenticated_team_member';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const isAuthenticated = session?.value === AUTH_TOKEN_VALUE;
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const cleanPassword = (password || '').trim();

    if (cleanPassword === DEFAULT_PASSCODE) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      // Set session cookie valid for 30 days
      response.cookies.set(AUTH_COOKIE_NAME, AUTH_TOKEN_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Incorrect passcode' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Auth failed: ' + String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
