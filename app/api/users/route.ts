import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, name, password } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanName || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Username, Full Name, and Password are all required.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await db.getUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A team member with this username already exists.' },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(cleanPassword);
    const createdUser = await db.createUser({
      username: cleanUsername,
      name: cleanName,
      passwordHash: hash,
      salt
    });

    return NextResponse.json({ success: true, data: createdUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user: ' + String(error) },
      { status: 500 }
    );
  }
}
