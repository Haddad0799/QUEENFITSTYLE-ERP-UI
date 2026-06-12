import type { StockSkuDTO } from '../../types/stock';
import { StockStatusBadge } from './StockStatusBadge';
import { InboxIcon, PlusIcon } from '../icons';

type Props = {
  skus: StockSkuDTO[];
  onInbound: (sku: StockSkuDTO) => void;
};

const EmptyState = () => (
  <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-faint">
      <InboxIcon className="h-5 w-5" />
    </span>
    <span className="text-sm font-medium text-heading">
      Nenhum SKU encontrado
    </span>
    <span className="text-[11px] text-faint">
      Esta cor ainda não possui tamanhos com estoque.
    </span>
  </div>
);

export function StockSkuTable({ skus, onInbound }: Props) {
  const colCount = 7;

  const inboundButton = (sku: StockSkuDTO) => (
    <button
      type="button"
      onClick={() => onInbound(sku)}
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
            {skus.length === 0 && (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-10 text-center text-xs text-muted"
                >
                  <EmptyState />
                </td>
              </tr>
            )}
            {skus.map((sku) => (
              <tr
                key={sku.skuId}
                className="border-t border-edge transition-colors hover:bg-surface-alt"
              >
                <td className="px-4 py-3 align-middle text-xs font-medium text-heading">
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-edge md:hidden">
        {skus.length === 0 && (
          <div className="px-4 py-10 text-center">
            <EmptyState />
          </div>
        )}
        {skus.map((sku) => (
          <div
            key={sku.skuId}
            className="flex w-full items-start gap-3 px-4 py-3 text-left"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-heading">
                {sku.sizeName ?? sku.skuCode}
              </span>
              <span className="text-[11px] text-muted">{sku.skuCode}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
