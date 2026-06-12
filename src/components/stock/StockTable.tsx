import { Fragment } from 'react';
import type { StockMovementDTO, StockOverviewDTO } from '../../types/stock';
import { StockStatusBadge } from './StockStatusBadge';
import { StockMovementsPanel } from './StockMovementsPanel';
import { ChevronDownIcon, InboxIcon, PlusIcon } from '../icons';

export type StockMovementsState = {
  data: StockMovementDTO[] | null;
  isLoading: boolean;
  error: string | null;
};

type Props = {
  items: StockOverviewDTO[];
  isLoading: boolean;
  error: string | null;
  expandedSkuId: number | null;
  movements: StockMovementsState;
  onToggleRow: (sku: StockOverviewDTO) => void;
  onInbound: (sku: StockOverviewDTO) => void;
};

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="border-t border-edge">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 w-full max-w-[100px] animate-pulse rounded bg-surface-alt" />
      </td>
    ))}
  </tr>
);

const EmptyState = () => (
  <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-faint">
      <InboxIcon className="h-5 w-5" />
    </span>
    <span className="text-sm font-medium text-heading">
      Nenhum SKU encontrado
    </span>
    <span className="text-[11px] text-faint">
      Ajuste o filtro ou cadastre produtos com variações.
    </span>
  </div>
);

export function StockTable({
  items,
  isLoading,
  error,
  expandedSkuId,
  movements,
  onToggleRow,
  onInbound,
}: Props) {
  const isEmpty = !isLoading && !error && items.length === 0;
  const colCount = 9;

  const inboundButton = (sku: StockOverviewDTO) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onInbound(sku);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
    >
      <PlusIcon className="h-3 w-3" />
      Abastecer
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 text-left font-semibold">Produto</th>
              <th className="px-4 py-3 text-left font-semibold">Cor</th>
              <th className="px-4 py-3 text-left font-semibold">Tamanho</th>
              <th className="px-4 py-3 text-left font-semibold">SKU</th>
              <th className="px-4 py-3 text-right font-semibold">Disponível</th>
              <th className="px-4 py-3 text-right font-semibold">Reservado</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && items.length === 0 && (
              <>
                <SkeletonRow cols={colCount} />
                <SkeletonRow cols={colCount} />
                <SkeletonRow cols={colCount} />
              </>
            )}
            {!isLoading && error && (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-8 text-center text-xs text-danger"
                >
                  {error}
                </td>
              </tr>
            )}
            {isEmpty && (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-10 text-center text-xs text-muted"
                >
                  <EmptyState />
                </td>
              </tr>
            )}
            {items.map((sku) => {
              const isExpanded = expandedSkuId === sku.skuId;
              return (
                <Fragment key={sku.skuId}>
                  <tr
                    className="cursor-pointer border-t border-edge transition-colors hover:bg-surface-alt"
                    onClick={() => onToggleRow(sku)}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <ChevronDownIcon
                          className={`h-3.5 w-3.5 flex-shrink-0 text-faint transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        <span className="text-xs font-semibold text-heading">
                          {sku.productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-body">
                      {sku.colorName ?? '—'}
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-body">
                      {sku.sizeName ?? '—'}
                    </td>
                    <td className="px-4 py-3 align-middle text-[11px] text-muted">
                      {sku.skuCode}
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-xs font-semibold text-heading tabular-nums">
                      {sku.available}
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-xs text-body tabular-nums">
                      {sku.reserved}
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-xs text-body tabular-nums">
                      {sku.quantity}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StockStatusBadge lowStock={sku.lowStock} />
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex items-center justify-end">
                        {inboundButton(sku)}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t border-edge bg-surface-alt/50">
                      <td colSpan={colCount} className="p-0">
                        <StockMovementsPanel
                          movements={movements.data}
                          isLoading={movements.isLoading}
                          error={movements.error}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-edge md:hidden">
        {isLoading && items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted">
            Carregando estoque...
          </div>
        )}
        {!isLoading && error && (
          <div className="px-4 py-8 text-center text-sm text-danger">
            {error}
          </div>
        )}
        {isEmpty && (
          <div className="px-4 py-10 text-center">
            <EmptyState />
          </div>
        )}
        {items.map((sku) => {
          const isExpanded = expandedSkuId === sku.skuId;
          const variant = [sku.colorName, sku.sizeName]
            .filter(Boolean)
            .join(' · ');
          return (
            <div key={sku.skuId}>
              {/* div clicável (não <button>) para permitir o botão Abastecer aninhado */}
              <div
                onClick={() => onToggleRow(sku)}
                className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt active:bg-surface-alt"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium text-heading">
                    {sku.productName}
                  </span>
                  <span className="text-[11px] text-muted">
                    {variant ? `${variant} · ` : ''}
                    {sku.skuCode}
                  </span>
                  <span className="text-[11px] text-body">
                    Disponível:{' '}
                    <span className="font-semibold text-heading">
                      {sku.available}
                    </span>{' '}
                    · Reservado: {sku.reserved} · Total: {sku.quantity}
                  </span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <StockStatusBadge lowStock={sku.lowStock} />
                    {inboundButton(sku)}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`mt-1 h-4 w-4 flex-shrink-0 text-faint transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {isExpanded && (
                <div className="border-t border-edge bg-surface-alt/50">
                  <StockMovementsPanel
                    movements={movements.data}
                    isLoading={movements.isLoading}
                    error={movements.error}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
