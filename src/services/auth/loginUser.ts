import { prisma } from '@/lib/db/prisma';
import { doesPasswordMatch } from '@/utils/password';
import { createSession } from '@/lib/session/session';
import { InvalidCredentialsError } from '@/lib/errors/authErrors';
import type { AuthenticatedUser } from '@/types/auth';

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new InvalidCredentialsError();

  const isPasswordValid = await doesPasswordMatch({
    password,
    passwordHash: user.passwordHash,
  });

  if (!isPasswordValid) throw new InvalidCredentialsError();

  await createSession({ userId: user.id });

  return { id: user.id, name: user.name, email: user.email };
}