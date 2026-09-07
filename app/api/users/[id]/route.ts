import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Prevent deleting your own logged-in account
    if (currentUser.id === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own currently logged-in account.' },
        { status: 400 }
      );
    }

    const success = await db.deleteUser(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user: ' + String(error) },
      { status: 500 }
    );
  }
}
