import bcrypt from 'bcrypt';
import { PASSWORD_HASH_SALT_ROUNDS } from '@/constants/auth';

export function hashPassword({ password }: { password: string }): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);
}

export function doesPasswordMatch({
  password,
  passwordHash,
}: {
  password: string;
  passwordHash: string;
}): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}