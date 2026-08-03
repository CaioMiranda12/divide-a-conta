import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '@/constants/auth';

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});