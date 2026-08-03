'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/useLogin';
import { useRegister } from '@/hooks/useRegister';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_already_in_use: 'Já existe uma conta com esse e-mail.',
  invalid_body: 'Preencha os campos corretamente.',
  unknown_error: 'Algo deu errado. Tente novamente.',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isSubmitting: isLoggingIn, errorCode: loginErrorCode } = useLogin();
  const { register, isSubmitting: isRegistering, errorCode: registerErrorCode } = useRegister();

  const isSubmitting = isLoggingIn || isRegistering;
  const errorCode = mode === 'login' ? loginErrorCode : registerErrorCode;
  const isRegisterMode = mode === 'register';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const isPasswordTooShort = isRegisterMode && password.length < 8;

    if (isPasswordTooShort) return;

    const user = isRegisterMode
      ? await register({ name, email, password })
      : await login({ email, password });

    const hasSucceeded = Boolean(user);

    if (hasSucceeded) router.push(redirectTo);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display text-2xl tracking-wide mb-1">
          {isRegisterMode ? 'Criar conta' : 'Entrar'}
        </h1>
        <p className="font-money text-xs text-ink-muted mb-6">divide a conta</p>

        <div className="space-y-3">
          {isRegisterMode && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome"
              required
              className="w-full bg-transparent border-b border-paper-line py-2 font-body text-sm focus:outline-none focus:border-ink"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            required
            className="w-full bg-transparent border-b border-paper-line py-2 font-body text-sm focus:outline-none focus:border-ink"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            required
            minLength={isRegisterMode ? 8 : undefined}
            className="w-full bg-transparent border-b border-paper-line py-2 font-body text-sm focus:outline-none focus:border-ink"
          />
        </div>

        {errorCode && (
          <p className="mt-3 text-sm font-body text-stamp">
            {AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.unknown_error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
        >
          {isRegisterMode ? 'Criar conta' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={() => setMode(isRegisterMode ? 'login' : 'register')}
          className="mt-4 w-full text-sm font-body text-ink-muted hover:text-ink"
        >
          {isRegisterMode ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}