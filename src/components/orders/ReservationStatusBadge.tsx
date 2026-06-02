import type { OrderReservationStatus } from '../../types/orders';

type Meta = {
  label: string;
  styles: string;
  dot: string;
};

const META: Record<string, Meta> = {
  RESERVED: {
    label: 'Reservado',
    styles:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Confirmada',
    styles:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40',
    dot: 'bg-emerald-500',
  },
  RELEASED: {
    label: 'Liberada',
    styles:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/40',
    dot: 'bg-blue-500',
  },
  EXPIRED: {
    label: 'Expirada',
    styles:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
};

const FALLBACK: Meta = {
  label: '',
  styles:
    'bg-surface-alt text-body border-edge dark:bg-surface-alt dark:text-body',
  dot: 'bg-faint',
};

type Props = {
  status: OrderReservationStatus;
};

export function ReservationStatusBadge({ status }: Props) {
  const meta = META[status] ?? { ...FALLBACK, label: status };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${meta.styles}`}
    >
      <span className={`inline-block h-1 w-1 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
