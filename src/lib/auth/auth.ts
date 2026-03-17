import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || 'change-this-secret-key'
);

const COOKIE_NAME = 'admin_session';
const TOKEN_EXPIRY = '7d';

export interface AdminSession {
  username: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

/**
 * Verify admin credentials
 */
export function verifyCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  return username === adminUsername && password === adminPassword;
}

/**
 * Create admin session token
 */
export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify session token
 */
export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Validate payload has required properties
    if (
      typeof payload.username === 'string' &&
      typeof payload.isAdmin === 'boolean' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return payload as AdminSession;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySession(token);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
