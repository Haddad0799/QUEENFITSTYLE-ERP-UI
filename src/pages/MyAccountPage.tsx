import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { authService } from '../services/auth';
import { useToast } from '../components/toast/ToastProvider';
import { MailIcon, LockIcon } from '../components/icons';

/** E-mail simples: algo@algo.dominio. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

const messageFrom = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

export function MyAccountPage() {
  const toast = useToast();

  // E-mail atual carregado do backend, para exibir e detectar alterações.
  const [currentEmail, setCurrentEmail] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null);

  const loadEmail = async () => {
    setIsLoadingEmail(true);
    setEmailLoadError(null);
    try {
      const data = await authService.getMe();
      setCurrentEmail(data.email ?? '');
    } catch (err) {
      setEmailLoadError(
        messageFrom(err, 'Não foi possível carregar o e-mail atual.'),
      );
    } finally {
      setIsLoadingEmail(false);
    }
  };

  useEffect(() => {
    loadEmail();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-heading sm:text-xl">
          Minha conta
        </h1>
        <p className="text-xs text-muted">
          Atualize o e-mail de login e a senha de acesso ao painel.
        </p>
      </div>

      <EmailSection
        currentEmail={currentEmail}
        isLoadingEmail={isLoadingEmail}
        emailLoadError={emailLoadError}
        onRetryLoad={loadEmail}
        onEmailUpdated={setCurrentEmail}
        toastSuccess={toast.success}
      />

      <PasswordSection toastSuccess={toast.success} />
    </div>
  );
}

function EmailSection({
  currentEmail,
  isLoadingEmail,
  emailLoadError,
  onRetryLoad,
  onEmailUpdated,
  toastSuccess,
}: {
  currentEmail: string;
  isLoadingEmail: boolean;
  emailLoadError: string | null;
  onRetryLoad: () => void;
  onEmailUpdated: (email: string) => void;
  toastSuccess: (title: string, description?: string) => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mantém o campo sincronizado com o e-mail carregado/atualizado.
  useEffect(() => {
    setNewEmail(currentEmail);
  }, [currentEmail]);

  const emailError = useMemo(() => {
    if (newEmail.trim().length === 0) return 'Informe o novo e-mail.';
    if (!isValidEmail(newEmail)) return 'Informe um e-mail válido.';
    return null;
  }, [newEmail]);

  const isDirty = newEmail.trim() !== currentEmail.trim();

  const canSubmit =
    !isSaving &&
    !isLoadingEmail &&
    !emailError &&
    isDirty &&
    currentPassword.length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    setError(null);
    try {
      const trimmed = newEmail.trim();
      await authService.updateEmail({
        newEmail: trimmed,
        currentPassword,
      });
      onEmailUpdated(trimmed);
      setCurrentPassword('');
      toastSuccess(
        'E-mail atualizado',
        'Use o novo e-mail no próximo acesso ao painel.',
      );
    } catch (err) {
      setError(messageFrom(err, 'Não foi possível atualizar o e-mail.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section
      icon={<MailIcon className="h-3.5 w-3.5" />}
      title="E-mail de login"
      subtitle="É com este e-mail que você entra no painel."
    >
      {emailLoadError && (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
          <span>{emailLoadError}</span>
          <button
            type="button"
            onClick={onRetryLoad}
            className="inline-flex h-7 items-center rounded-md border border-danger-edge bg-surface px-2 font-medium text-danger hover:bg-surface-alt"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="account-email"
          label="Novo e-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={isLoadingEmail ? 'Carregando…' : 'voce@queenfitstyle.com'}
          value={newEmail}
          onChange={setNewEmail}
          disabled={isSaving || isLoadingEmail}
          error={emailError}
        />

        <PasswordField
          id="account-email-current-password"
          label="Senha atual"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          disabled={isSaving || isLoadingEmail}
          helper="Confirme com sua senha atual para alterar o e-mail."
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger"
          >
            {error}
          </div>
        )}

        <SaveButton
          isSaving={isSaving}
          disabled={!canSubmit}
          label="Salvar e-mail"
        />
      </form>
    </Section>
  );
}

function PasswordSection({
  toastSuccess,
}: {
  toastSuccess: (title: string, description?: string) => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    if (newPassword.length === 0 && confirmPassword.length === 0) return null;
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (newPassword === currentPassword && currentPassword.length > 0) {
      return 'A nova senha precisa ser diferente da atual.';
    }
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      return 'A confirmação não confere com a nova senha.';
    }
    return null;
  }, [currentPassword, newPassword, confirmPassword]);

  const canSubmit =
    !isSaving &&
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword !== currentPassword &&
    confirmPassword === newPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    setError(null);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toastSuccess(
        'Senha atualizada',
        'Use a nova senha no próximo acesso ao painel.',
      );
    } catch (err) {
      setError(messageFrom(err, 'Não foi possível atualizar a senha.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section
      icon={<LockIcon className="h-3.5 w-3.5" />}
      title="Senha"
      subtitle={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField
          id="account-new-password"
          label="Nova senha"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
          show={showPasswords}
          disabled={isSaving}
        />

        <PasswordField
          id="account-confirm-password"
          label="Confirmar nova senha"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showPasswords}
          disabled={isSaving}
        />

        <PasswordField
          id="account-password-current"
          label="Senha atual"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showPasswords}
          disabled={isSaving}
          helper="Confirme com sua senha atual para alterar a senha."
        />

        <label className="flex items-center gap-2 text-[11px] text-muted">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer accent-[#a0673a]"
          />
          Mostrar senhas
        </label>

        {(validation || error) && (
          <div
            role="alert"
            className="rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger"
          >
            {error ?? validation}
          </div>
        )}

        <SaveButton
          isSaving={isSaving}
          disabled={!canSubmit}
          label="Salvar nova senha"
        />
      </form>
    </Section>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex max-w-xl flex-col gap-4 rounded-xl border border-edge bg-surface p-4 text-xs sm:p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
          {icon}
        </span>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-heading">{title}</h2>
          <span className="text-[10px] text-muted">{subtitle}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function SaveButton({
  isSaving,
  disabled,
  label,
}: {
  isSaving: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-end">
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-on-brand shadow shadow-brand/30 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {isSaving ? 'Salvando…' : label}
      </button>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: 'tel' | 'email' | 'text';
  autoComplete?: string;
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && Boolean(error);

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
        onBlur={() => setTouched(true)}
        disabled={disabled}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`h-9 w-full rounded-lg border bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:ring-2 disabled:opacity-60 ${
          showError
            ? 'border-danger-edge focus:border-danger-edge focus:ring-danger/25'
            : 'border-edge-strong focus:border-brand focus:ring-brand/25'
        }`}
      />
      {showError && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
  autoComplete,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow?: () => void;
  disabled?: boolean;
  autoComplete?: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
          style={onToggleShow ? { paddingRight: '4rem' } : undefined}
        />
        {onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-2 top-1/2 inline-flex h-6 -translate-y-1/2 items-center rounded-md px-2 text-[10px] font-medium text-muted hover:bg-surface-alt hover:text-heading"
          >
            {show ? 'ocultar' : 'mostrar'}
          </button>
        )}
      </div>
      {helper && <p className="text-[11px] leading-relaxed text-faint">{helper}</p>}
    </div>
  );
}
