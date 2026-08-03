import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/session/session';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import type { AuthenticatedUser } from '@/types/auth';

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });

  return user;
}

export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) throw new UnauthenticatedError();

  return user;
}