import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { username, password } = await request.json();

    // Валидация входных данных
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`Login attempt for non-existent user: ${username}`); // Added log
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Проверка пароля
    console.log(`Login attempt for user: ${username}`); // Added log
    console.log(`Provided password (DEBUG ONLY): ${password}`); // Added log - REMOVE IN PRODUCTION
    console.log(`Stored hashed password (DEBUG ONLY): ${user.password}`); // Added log - REMOVE IN PRODUCTION

    const isPasswordValid = await user.comparePassword(password);
    console.log(`Password comparison result: ${isPasswordValid}`); // Added log

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Проверка роли админа
    if (user.role !== 'admin') {
      console.log(`User ${username} is not an admin. Role: ${user.role}`); // Added log
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Создание JWT токена
    const token = await createToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    });

    // Создание ответа с cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token: token
    });

    // Установка cookie
    setAuthCookie(response, token);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 