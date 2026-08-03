import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/utils/password';
import { createSession } from '@/lib/session/session';
import { EmailAlreadyInUseError } from '@/lib/errors/authErrors';
import type { AuthenticatedUser } from '@/types/auth';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = 'P2002';

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const passwordHash = await hashPassword({ password });

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    await createSession({ userId: user.id });

    return user;
  } catch (error) {
    const isUniqueConstraintViolation =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE;

    if (isUniqueConstraintViolation) throw new EmailAlreadyInUseError();

    throw error;
  }
}