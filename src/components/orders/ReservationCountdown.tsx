import { useNow } from '../../hooks/useNow';

type Props = {
  expiresAt: string | null | undefined;
  /**
   * Quando `true`, o contador é renderizado mesmo se o pedido já não
   * estiver mais com reservas ativas (para fins de auditoria).
   */
  showWhenExpired?: boolean;
  size?: 'sm' | 'xs';
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatDelta = (ms: number) => {
  if (ms >= DAY) {
    const days = Math.floor(ms / DAY);
    return days === 1 ? '1 dia' : `${days} dias`;
  }
  if (ms >= HOUR) {
    const hours = Math.floor(ms / HOUR);
    const minutes = Math.floor((ms % HOUR) / MINUTE);
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  if (ms >= MINUTE) {
    const minutes = Math.floor(ms / MINUTE);
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  }
  return 'menos de 1 minuto';
};

export function ReservationCountdown({
  expiresAt,
  showWhenExpired = true,
  size = 'sm',
}: Props) {
  const now = useNow();

  if (!expiresAt) {
    return <span className="text-faint">—</span>;
  }

  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) {
    return <span className="text-faint">—</span>;
  }

  const delta = target - now;
  const expired = delta <= 0;

  if (expired && !showWhenExpired) {
    return null;
  }

  const sizeClasses =
    size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  if (expired) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 font-medium text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200 ${sizeClasses}`}
      >
        <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
        Expirada
      </span>
    );
  }

  /**
   * Quando faltam <= 5 min é crítico — destacamos com vermelho. Caso
   * contrário, mantemos o âmbar para indicar reserva ativa.
   */
  const critical = delta <= 5 * MINUTE;
  const tone = critical
    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'
    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${tone} ${sizeClasses}`}
    >
      <span
        className={`inline-block h-1 w-1 rounded-full ${
          critical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      Expira em {formatDelta(delta)}
    </span>
  );
}
