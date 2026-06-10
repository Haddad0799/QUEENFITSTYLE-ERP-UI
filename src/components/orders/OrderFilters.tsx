import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { OrderListFilters, OrderStatus } from '../../types/orders';
import { ORDER_STATUS_LABEL } from './OrderStatusBadge';
import { UserIcon } from '../icons';

type Props = {
  value: OrderListFilters;
  totalItems: number;
  isRefetching?: boolean;
  onChange: (next: OrderListFilters) => void;
};

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED',
  'RETURNED',
];

type PeriodKey = 'week' | 'month' | 'year';

/** Formata uma data no fuso local como `YYYY-MM-DD` (sem deslocamento UTC). */
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Atalhos de período. Cada `resolve()` calcula `from`/`to` relativos ao dia
 * atual, com `to` sempre no dia de hoje e `from` no início do período.
 */
const PERIOD_OPTIONS: {
  key: PeriodKey;
  label: string;
  resolve: () => { from: string; to: string };
}[] = [
  {
    key: 'week',
    label: 'Esta semana',
    resolve: () => {
      const now = new Date();
      // segunda-feira como início da semana (ISO 8601)
      const offsetToMonday = (now.getDay() + 6) % 7;
      const start = new Date(now);
      start.setDate(now.getDate() - offsetToMonday);
      return { from: toISODate(start), to: toISODate(now) };
    },
  },
  {
    key: 'month',
    label: 'Este mês',
    resolve: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISODate(start), to: toISODate(now) };
    },
  },
  {
    key: 'year',
    label: 'Este ano',
    resolve: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: toISODate(start), to: toISODate(now) };
    },
  },
];

/**
 * Descobre qual atalho de período corresponde aos filtros atuais comparando
 * `createdAtFrom`/`createdAtTo` com o que cada atalho resolveria no momento do
 * render. Um link salvo de "esta semana" de ontem não acende o botão hoje.
 */
function detectActivePeriod(filters: OrderListFilters): PeriodKey | null {
  const { createdAtFrom, createdAtTo } = filters;
  if (!createdAtFrom || !createdAtTo) return null;
  for (const option of PERIOD_OPTIONS) {
    const resolved = option.resolve();
    if (resolved.from === createdAtFrom && resolved.to === createdAtTo) {
      return option.key;
    }
  }
  return null;
}

/**
 * Debounce simples para inputs livres. Aplica `onChange` 300ms após a
 * última digitação para evitar disparar uma request por caractere.
 */
function useDebouncedFilter(
  value: OrderListFilters,
  field: keyof OrderListFilters,
  onChange: (next: OrderListFilters) => void,
  delay = 300,
) {
  const [local, setLocal] = useState<string>(
    (value[field] as string | undefined) ?? '',
  );

  useEffect(() => {
    setLocal((value[field] as string | undefined) ?? '');
  }, [value, field]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const current = (value[field] as string | undefined) ?? '';
      if (local !== current) {
        onChange({ ...value, [field]: local });
      }
    }, delay);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return [local, setLocal] as const;
}

export function OrderFilters({
  value,
  totalItems,
  isRefetching,
  onChange,
}: Props) {
  const [customerName, setCustomerName] = useDebouncedFilter(
    value,
    'customerName',
    onChange,
  );

  const activePeriod = detectActivePeriod(value);
  const hasDateFilter =
    Boolean(value.createdAtFrom) || Boolean(value.createdAtTo);
  const hasAnyFilter =
    Boolean(value.status) || Boolean(customerName) || hasDateFilter;

  const handlePeriod = (key: PeriodKey) => {
    if (activePeriod === key) {
      // atalho já ativo → limpa o período (toggle off)
      onChange({ ...value, createdAtFrom: undefined, createdAtTo: undefined });
      return;
    }
    const option = PERIOD_OPTIONS.find((opt) => opt.key === key);
    if (!option) return;
    const { from, to } = option.resolve();
    onChange({ ...value, createdAtFrom: from, createdAtTo: to });
  };

  const handleClearAll = () => {
    setCustomerName('');
    onChange({});
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Filtros
        </span>

        <select
          value={value.status ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as OrderStatus | '',
            })
          }
          className="h-8 rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABEL[status]}
            </option>
          ))}
        </select>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={handleClearAll}
            className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 text-[11px] font-medium text-muted transition hover:text-heading"
          >
            Limpar filtros
          </button>
        )}

        {!hasAnyFilter && (
          <div className="ml-auto flex items-center gap-2">
            {isRefetching && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                atualizando…
              </span>
            )}
            <span className="text-[11px] text-faint">
              {totalItems} resultado(s)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <FilterInput
          label="Cliente"
          placeholder="Nome do cliente"
          value={customerName}
          onChange={setCustomerName}
          icon={UserIcon}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            Período
          </label>
          <div className="flex items-center gap-1">
            {PERIOD_OPTIONS.map((option) => {
              const isActive = activePeriod === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handlePeriod(option.key)}
                  className={`inline-flex h-8 flex-1 items-center justify-center rounded-lg border px-2 text-[11px] font-medium transition ${
                    isActive
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-edge-strong bg-surface text-body hover:text-heading'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hasAnyFilter && (
        <div className="flex items-center justify-end gap-2">
          {isRefetching && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              atualizando…
            </span>
          )}
          <span className="text-[11px] text-faint">
            {totalItems} resultado(s)
          </span>
        </div>
      )}
    </div>
  );
}

function FilterInput({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-edge-strong bg-surface-input pl-7 pr-2 text-[11px] text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-faint">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
