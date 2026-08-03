import { SignJWT, jwtVerify } from 'jose';
import { SESSION_DURATION_IN_SECONDS } from '@/constants/auth';
import type { SessionPayload } from '@/types/auth';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export function signSessionToken({ userId }: SessionPayload): Promise<string> {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expirationInSeconds = nowInSeconds + SESSION_DURATION_IN_SECONDS;

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(nowInSeconds)
    .setExpirationTime(expirationInSeconds)
    .sign(secretKey);
}

export async function verifySessionToken({
  token,
}: {
  token: string;
}): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const hasUserId = typeof payload.userId === 'string';

    if (!hasUserId) return null;

    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}