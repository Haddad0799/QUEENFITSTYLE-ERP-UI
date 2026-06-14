import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { settingsService } from '../services/settings';
import { useToast } from '../components/toast/ToastProvider';
import { MessageCircleIcon, MailIcon } from '../components/icons';
import {
  isValidLocalPhone,
  maskLocalPhone,
  stripPhoneCountryCode,
  withPhoneCountryCode,
} from '../lib/format';

/** E-mail simples: algo@algo.dominio. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

export function SettingsPage() {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  // Valores carregados, para detectar alterações e habilitar o salvar.
  const [initial, setInitial] = useState({ whatsapp: '', email: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await settingsService.get();
      // Backend guarda 55 + DDD + número; na tela exibimos só DDD + número
      // mascarado — a dona não precisa pensar no código do país.
      const nextWhatsapp = maskLocalPhone(stripPhoneCountryCode(data.whatsappPhone));
      const nextEmail = data.notificationEmail ?? '';
      setWhatsapp(nextWhatsapp);
      setEmail(nextEmail);
      setInitial({ whatsapp: nextWhatsapp, email: nextEmail });
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar as configurações.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const whatsappError = useMemo(() => {
    if (whatsapp.trim().length === 0) return 'Informe o número de WhatsApp.';
    if (!isValidLocalPhone(whatsapp)) {
      return 'Informe DDD + número, ex.: (61) 98377-0131.';
    }
    return null;
  }, [whatsapp]);

  const emailError = useMemo(() => {
    if (email.trim().length === 0) return 'Informe o e-mail de avisos.';
    if (!isValidEmail(email)) return 'Informe um e-mail válido.';
    return null;
  }, [email]);

  const isDirty =
    whatsapp.trim() !== initial.whatsapp.trim() ||
    email.trim() !== initial.email.trim();

  const canSubmit =
    !isSaving && !whatsappError && !emailError && isDirty;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const data = await settingsService.update({
        // Reanexa o 55 só na hora de enviar — o backend continua recebendo o
        // número completo (ex.: 5561983770131).
        whatsappPhone: withPhoneCountryCode(whatsapp),
        notificationEmail: email.trim(),
      });
      const nextWhatsapp =
        data.whatsappPhone != null
          ? maskLocalPhone(stripPhoneCountryCode(data.whatsappPhone))
          : maskLocalPhone(whatsapp);
      const nextEmail = data.notificationEmail ?? email.trim();
      setWhatsapp(nextWhatsapp);
      setEmail(nextEmail);
      setInitial({ whatsapp: nextWhatsapp, email: nextEmail });
      toast.success(
        'Configurações salvas',
        'As alterações já estão valendo para a loja.',
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar as configurações.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-heading sm:text-xl">
          Configurações
        </h1>
        <p className="text-xs text-muted">
          Defina o WhatsApp de atendimento e o e-mail que recebe os avisos de
          novos pedidos.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-edge bg-surface p-6 text-sm text-label">
          Carregando configurações...
        </div>
      )}

      {!isLoading && loadError && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-danger-edge bg-danger-soft p-4 text-sm text-danger">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadSettings}
            className="inline-flex h-8 items-center rounded-lg border border-danger-edge bg-surface px-3 text-[11px] font-medium text-danger hover:bg-surface-alt"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !loadError && (
        <form
          onSubmit={handleSubmit}
          className="flex max-w-xl flex-col gap-5 rounded-xl border border-edge bg-surface p-4 text-xs sm:p-5"
        >
          <Field
            id="whatsapp"
            label="WhatsApp de atendimento"
            icon={<MessageCircleIcon className="h-3.5 w-3.5" />}
            helper="Número que aparece para a cliente na loja e nos avisos de pedido."
            placeholder="(61) 98377-0131"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(value) => setWhatsapp(maskLocalPhone(value))}
            disabled={isSaving}
            error={whatsappError}
          />

          <Field
            id="notification-email"
            label="E-mail de avisos"
            icon={<MailIcon className="h-3.5 w-3.5" />}
            helper="Para onde chegam as notificações de novos pedidos."
            placeholder="loja@exemplo.com"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            disabled={isSaving}
            error={emailError}
          />

          {saveError && (
            <div
              role="alert"
              className="rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger"
            >
              {saveError}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-on-brand shadow shadow-brand/30 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSaving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  helper,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  helper: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: 'tel' | 'email';
  autoComplete?: string;
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
      >
        <span className="text-faint">{icon}</span>
        {label}
      </label>
      <input
        id={id}
        type="text"
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
      <p className="text-[11px] leading-relaxed text-faint">{helper}</p>
      {showError && (
        <p className="text-[11px] text-danger">{error}</p>
      )}
    </div>
  );
}
