import { useEffect, useState } from 'react';
import type { OrderListFilters, OrderStatus } from '../../types/orders';
import { ORDER_STATUS_LABEL } from './OrderStatusBadge';

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
  const [phone, setPhone] = useDebouncedFilter(value, 'phone', onChange);
  const [skuCode, setSkuCode] = useDebouncedFilter(value, 'skuCode', onChange);

  const hasAnyTextFilter =
    Boolean(customerName) || Boolean(phone) || Boolean(skuCode);
  const hasDateFilter =
    Boolean(value.createdAtFrom) || Boolean(value.createdAtTo);
  const hasAnyFilter =
    Boolean(value.status) || hasAnyTextFilter || hasDateFilter;

  const handleClearAll = () => {
    setCustomerName('');
    setPhone('');
    setSkuCode('');
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <FilterInput
          label="Cliente"
          placeholder="Nome do cliente"
          value={customerName}
          onChange={setCustomerName}
          icon="👤"
        />
        <FilterInput
          label="Telefone"
          placeholder="Ex: 11999998888"
          value={phone}
          onChange={setPhone}
          icon="📞"
        />
        <FilterInput
          label="SKU"
          placeholder="Código do SKU"
          value={skuCode}
          onChange={setSkuCode}
          icon="🏷️"
        />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            Período
          </label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={value.createdAtFrom ?? ''}
              onChange={(e) =>
                onChange({ ...value, createdAtFrom: e.target.value })
              }
              className="h-8 w-full min-w-0 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
            <span className="text-faint">–</span>
            <input
              type="date"
              value={value.createdAtTo ?? ''}
              onChange={(e) =>
                onChange({ ...value, createdAtTo: e.target.value })
              }
              className="h-8 w-full min-w-0 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
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
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
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
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] opacity-60">
          {icon}
        </span>
      </div>
    </div>
  );
}
