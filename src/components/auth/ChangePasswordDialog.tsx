import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { authService } from '../../services/auth';
import { useToast } from '../toast/ToastProvider';

type Props = {
  open: boolean;
  onClose: () => void;
};

const MIN_PASSWORD_LENGTH = 8;

export function ChangePasswordDialog({ open, onClose }: Props) {
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswords(false);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

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
    !isSubmitting &&
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword !== currentPassword &&
    confirmPassword === newPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success(
        'Senha atualizada',
        'Use a nova senha no próximo acesso ao sistema.',
      );
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível trocar a senha.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-edge bg-surface p-5 text-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
            🔒
          </span>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-heading">
              Alterar senha
            </h3>
            <span className="text-[10px] text-muted">
              Mínimo de {MIN_PASSWORD_LENGTH} caracteres.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <PasswordField
            id="current-password"
            label="Senha atual"
            autoComplete="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showPasswords}
            disabled={isSubmitting}
            autoFocus
          />

          <PasswordField
            id="new-password"
            label="Nova senha"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            show={showPasswords}
            disabled={isSubmitting}
          />

          <PasswordField
            id="confirm-password"
            label="Confirmar nova senha"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showPasswords}
            disabled={isSubmitting}
          />

          <label className="flex items-center gap-2 text-[11px] text-muted">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-pink-500"
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

          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-[11px] font-semibold text-on-brand shadow shadow-brand/30 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  disabled,
  autoFocus,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
      />
    </div>
  );
}
