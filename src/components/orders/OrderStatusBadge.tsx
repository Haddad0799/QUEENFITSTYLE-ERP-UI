import type { OrderStatus } from '../../types/orders';

const STATUS_LABEL: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Aguardando confirmação',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Em preparo',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
};

const STATUS_SHORT: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Pendente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparo',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40',
  CONFIRMED:
    'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  PREPARING:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40',
  SHIPPED:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40',
  DELIVERED:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40',
  CANCELLED:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/40',
  EXPIRED:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const DOT_STYLES: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION:
    'bg-amber-500 dark:bg-amber-300 animate-pulse',
  CONFIRMED: 'bg-emerald-500 dark:bg-emerald-300',
  PREPARING: 'bg-blue-500 dark:bg-blue-300',
  SHIPPED: 'bg-indigo-500 dark:bg-indigo-300',
  DELIVERED: 'bg-emerald-600 dark:bg-emerald-400',
  CANCELLED: 'bg-rose-500 dark:bg-rose-300',
  EXPIRED: 'bg-gray-400 dark:bg-gray-500',
};

type Props = {
  status: OrderStatus;
  size?: 'sm' | 'md';
  compact?: boolean;
};

export function OrderStatusBadge({ status, size = 'sm', compact = false }: Props) {
  const label = compact ? STATUS_SHORT[status] : STATUS_LABEL[status];
  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {label}
    </span>
  );
}

export const ORDER_STATUS_LABEL = STATUS_LABEL;
