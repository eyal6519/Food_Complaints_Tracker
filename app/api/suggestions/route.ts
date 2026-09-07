import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const suggestions = await db.getSuggestions();
    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions: ' + String(error) },
      { status: 500 }
    );
  }
}
