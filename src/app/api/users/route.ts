import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_USERS } from '@/lib/auth';

export async function GET() {
  try {
    const dbUsers = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true },
      orderBy: { username: 'asc' },
    });
    return NextResponse.json({ success: true, data: dbUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    const fallbackList = Object.values(DEFAULT_USERS).map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
    }));
    return NextResponse.json({ success: true, data: fallbackList });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, name, role = 'User' } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, error: 'Invalid User ID. Use alphanumeric characters only.' },
        { status: 400 }
      );
    }

    const displayName = name?.trim() || cleanUsername;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `User "${cleanUsername}" already exists` },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        name: displayName,
        password: 'test',
        role: role === 'Admin' ? 'Admin' : 'User',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user in database' },
      { status: 500 }
    );
  }
}
