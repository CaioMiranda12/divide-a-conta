import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '@/constants/auth';

export const registerSchema = z.object({
  name: z.string().min(1, 'Informe seu nome'),
  email: z.string().email('E-mail inválido').transform((email) => email.trim().toLowerCase()),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1, 'Informe sua senha'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;