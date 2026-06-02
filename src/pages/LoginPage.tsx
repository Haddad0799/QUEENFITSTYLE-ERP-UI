import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type LocationState = { from?: string } | null;

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: LocationState };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedEmail = email.trim();
  const isValid = trimmedEmail.length > 0 && password.length > 0;
  const redirectTo = location.state?.from ?? '/';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || isLoggingIn) return;
    setError(null);
    try {
      await login(trimmedEmail, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível entrar.',
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-300 text-lg font-bold text-white shadow-lg shadow-pink-500/30">
            QF
          </div>
          <div>
            <h1 className="text-lg font-semibold text-heading">
              QueenFitStyle Backoffice
            </h1>
            <p className="text-xs text-muted">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface p-5 shadow-sm"
        >
          <Field
            label="E-mail"
            id="email"
            type="email"
            autoComplete="username"
            placeholder="voce@queenfitstyle.com"
            value={email}
            onChange={setEmail}
            disabled={isLoggingIn}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input pl-3 pr-12 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 inline-flex h-7 -translate-y-1/2 items-center rounded-md px-2 text-[11px] font-medium text-muted hover:bg-surface-alt hover:text-heading"
              >
                {showPassword ? 'ocultar' : 'mostrar'}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoggingIn}
            className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingIn && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isLoggingIn ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
          💡 <span className="font-medium text-label">Primeiro acesso?</span>{' '}
          Após entrar com a senha temporária, vá em
          <br />
          <span className="font-medium text-heading">
            Menu do usuário → Alterar senha
          </span>{' '}
          no canto superior direito.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  autoFocus,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
      />
    </div>
  );
}
