import { db } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json({ message: 'identifier and password required' }, { status: 400 });
  }
  
  try {

    const [rows] = await db.query('SELECT * FROM system_super_admin WHERE username = ?', [identifier]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
 
    if (password !== user.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }


    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username }
    });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
