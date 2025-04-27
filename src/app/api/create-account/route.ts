import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { openDb } from '@/lib/db'; // Your database utility

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
      username,
      hashedPassword,
      'user', // Default role for new users, change if needed
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the account' },
      { status: 500 }
    );
  }
}
