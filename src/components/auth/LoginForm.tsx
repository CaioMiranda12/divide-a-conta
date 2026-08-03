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

    const user = isRegisterMode
      ? await register({ name, email, password })
      : await login({ email, password });

    const hasSucceeded = Boolean(user);

    if (hasSucceeded) router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>{isRegisterMode ? 'Criar conta' : 'Entrar'}</h1>

      {isRegisterMode && (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome"
          required
        />
      )}

      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="E-mail"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Senha"
        required
      />

      {errorCode && <p>{AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.unknown_error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isRegisterMode ? 'Criar conta' : 'Entrar'}
      </button>

      <button type="button" onClick={() => setMode(isRegisterMode ? 'login' : 'register')}>
        {isRegisterMode ? 'Já tenho conta' : 'Criar conta'}
      </button>
    </form>
  );
}