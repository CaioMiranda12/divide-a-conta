'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { useLogin } from '@/hooks/useLogin';
import { AuthTextField } from '@/components/form/AuthTextField';
import { getSafeRedirectPath } from '@/utils/redirect';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  unknown_error: 'Algo deu errado. Tente novamente.',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath({ redirectTo: searchParams.get('redirect') });

  const { login, isSubmitting, errorCode, fieldErrors } = useLogin();

  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      if (messages?.[0]) form.setError(field as keyof LoginFormValues, { message: messages[0] });
    });
  }, [fieldErrors, form]);

  async function handleSubmit(values: LoginFormValues) {
    const user = await login(values);

    if (user) router.push(redirectTo);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl tracking-wide mb-1">Entrar</h1>
        <p className="font-money text-xs text-ink-muted mb-6">divide a conta</p>

        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-3">
          <AuthTextField
            {...form.register('email')}
            placeholder="E-mail"
            errorMessage={form.formState.errors.email?.message}
          />
          <AuthTextField
            type="password"
            {...form.register('password')}
            placeholder="Senha"
            errorMessage={form.formState.errors.password?.message}
          />

          {errorCode && (
            <p className="text-sm font-body text-stamp">
              {LOGIN_ERROR_MESSAGES[errorCode] ?? LOGIN_ERROR_MESSAGES.unknown_error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <Link
          href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="mt-4 block text-center text-sm font-body text-ink-muted hover:text-ink"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}