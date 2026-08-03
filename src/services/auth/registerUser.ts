import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/utils/password';
import { createSession } from '@/lib/session/session';
import { EmailAlreadyInUseError } from '@/lib/errors/authErrors';
import type { AuthenticatedUser } from '@/types/auth';

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) throw new EmailAlreadyInUseError();

  const passwordHash = await hashPassword({ password });

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  await createSession({ userId: user.id });

  return user;
}