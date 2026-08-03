import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_DURATION_IN_SECONDS } from '@/constants/auth';
import { signSessionToken, verifySessionToken } from '@/lib/session/jwt';
import type { SessionPayload } from '@/types/auth';

export async function createSession({ userId }: { userId: string }): Promise<void> {
  const token = await signSessionToken({ userId });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_IN_SECONDS,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionToken({ token });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}