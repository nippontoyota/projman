import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { AuthUser } from '@/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'incheon-river-ev-projman-secret-key-2026';
export const SESSION_COOKIE_NAME = 'projman_session';

export const DEFAULT_USERS: Record<string, { id: string; username: string; name: string; role: 'Admin' | 'User'; password: string }> = {
  admin: {
    id: 'usr-admin',
    username: 'admin',
    name: 'Admin',
    role: 'Admin',
    password: 'test',
  },
  user1: {
    id: 'usr-user1',
    username: 'user1',
    name: 'User 1',
    role: 'User',
    password: 'test',
  },
  user2: {
    id: 'usr-user2',
    username: 'user2',
    name: 'User 2',
    role: 'User',
    password: 'test',
  },
  user3: {
    id: 'usr-user3',
    username: 'user3',
    name: 'User 3',
    role: 'User',
    password: 'test',
  },
};

/**
 * Creates a signed JWT-like session token with HMAC SHA-256
 */
export function createSessionToken(user: AuthUser): string {
  const payload = JSON.stringify({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${sig}`;
}

/**
 * Verifies the signed session token and extracts the authenticated user
 */
export function verifySessionToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');
    if (expectedSig !== sig) return null;

    const data = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;

    return {
      id: data.id,
      username: data.username,
      name: data.name,
      role: data.role as 'Admin' | 'User',
    };
  } catch {
    return null;
  }
}

/**
 * Reads the current session from incoming request cookies
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Authenticates against Supabase projman_users or fallback accounts
 */
export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  const cleanUser = username.trim().toLowerCase();

  // 1. Try DB lookup
  try {
    const dbUser = await prisma.user.findUnique({
      where: { username: cleanUser },
    });
    if (dbUser && dbUser.password === password) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role as 'Admin' | 'User',
      };
    }
  } catch (err) {
    console.warn('DB auth check exception (using fallback):', err);
  }

  // 2. Predefined fallback accounts
  const fallback = DEFAULT_USERS[cleanUser];
  if (fallback && fallback.password === password) {
    return {
      id: fallback.id,
      username: fallback.username,
      name: fallback.name,
      role: fallback.role,
    };
  }

  return null;
}
