'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '@/schemas/auth';
import { useLogin } from '@/hooks/useLogin';
import { useRegister } from '@/hooks/useRegister';
import { AuthTextField } from '@/components/form/AuthTextField';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_already_in_use: 'Já existe uma conta com esse e-mail.',
  unknown_error: 'Algo deu errado. Tente novamente.',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const isRegisterMode = mode === 'register';

  const { login, isSubmitting: isLoggingIn, errorCode: loginErrorCode, fieldErrors: loginFieldErrors } = useLogin();
  const {
    register: registerUser,
    isSubmitting: isRegistering,
    errorCode: registerErrorCode,
    fieldErrors: registerFieldErrors,
  } = useRegister();

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const isSubmitting = isLoggingIn || isRegistering;
  const errorCode = isRegisterMode ? registerErrorCode : loginErrorCode;

  useEffect(() => {
    Object.entries(loginFieldErrors).forEach(([field, messages]) => {
      if (messages?.[0]) loginForm.setError(field as keyof LoginFormValues, { message: messages[0] });
    });
  }, [loginFieldErrors, loginForm]);

  useEffect(() => {
    Object.entries(registerFieldErrors).forEach(([field, messages]) => {
      if (messages?.[0]) registerForm.setError(field as keyof RegisterFormValues, { message: messages[0] });
    });
  }, [registerFieldErrors, registerForm]);

  async function handleLoginSubmit(values: LoginFormValues) {
    const user = await login(values);

    if (user) router.push(redirectTo);
  }

  async function handleRegisterSubmit(values: RegisterFormValues) {
    const user = await registerUser(values);

    if (user) router.push(redirectTo);
  }

  function toggleMode() {
    setMode(isRegisterMode ? 'login' : 'register');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl tracking-wide mb-1">
          {isRegisterMode ? 'Criar conta' : 'Entrar'}
        </h1>
        <p className="font-money text-xs text-ink-muted mb-6">divide a conta</p>

        {isRegisterMode ? (
          <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} noValidate className="space-y-3">
            <AuthTextField
              {...registerForm.register('name')}
              placeholder="Nome"
              errorMessage={registerForm.formState.errors.name?.message}
            />
            <AuthTextField
              {...registerForm.register('email')}
              placeholder="E-mail"
              errorMessage={registerForm.formState.errors.email?.message}
            />
            <AuthTextField
              type="password"
              {...registerForm.register('password')}
              placeholder="Senha"
              errorMessage={registerForm.formState.errors.password?.message}
            />

            {errorCode && (
              <p className="text-sm font-body text-stamp">
                {AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.unknown_error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
            >
              Criar conta
            </button>
          </form>
        ) : (
          <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} noValidate className="space-y-3">
            <AuthTextField
              {...loginForm.register('email')}
              placeholder="E-mail"
              errorMessage={loginForm.formState.errors.email?.message}
            />
            <AuthTextField
              type="password"
              {...loginForm.register('password')}
              placeholder="Senha"
              errorMessage={loginForm.formState.errors.password?.message}
            />

            {errorCode && (
              <p className="text-sm font-body text-stamp">
                {AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.unknown_error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
            >
              Entrar
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 w-full text-sm font-body text-ink-muted hover:text-ink"
        >
          {isRegisterMode ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}