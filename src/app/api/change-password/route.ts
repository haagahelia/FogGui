import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { openDb } from '@/lib/db'; // Your database utility

export async function POST(req: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await req.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const passwordMatch = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.run('UPDATE users SET password = ? WHERE username = ?', [
      hashedPassword,
      username,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the password' },
      { status: 500 }
    );
  }
}
