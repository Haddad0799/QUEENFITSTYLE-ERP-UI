import type { OrderItemDTO } from '../../types/orders';
import { formatBRL } from '../../lib/format';

type Props = {
  items: OrderItemDTO[];
};

export function OrderItemsList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-edge bg-surface-alt px-4 py-6 text-center text-[11px] text-muted">
        Sem itens neste pedido.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-surface">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-2.5 text-left font-semibold">Produto</th>
              <th className="px-3 py-2.5 text-left font-semibold">SKU</th>
              <th className="px-3 py-2.5 text-left font-semibold">Cor</th>
              <th className="px-3 py-2.5 text-left font-semibold">Tamanho</th>
              <th className="px-3 py-2.5 text-right font-semibold">Qtd</th>
              <th className="px-3 py-2.5 text-right font-semibold">Unitário</th>
              <th className="px-3 py-2.5 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemId} className="border-t border-edge">
                <td className="px-3 py-2 align-middle">
                  <div className="flex items-center gap-2.5">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-10 w-10 flex-shrink-0 rounded-lg border border-edge object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-edge bg-surface-alt text-[10px] font-medium uppercase tracking-wide text-faint">
                        {item.skuCode?.slice(0, 3) ?? '—'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-heading">
                      {item.productName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 align-middle text-[11px] text-body">
                  <span className="font-mono">{item.skuCode}</span>
                </td>
                <td className="px-3 py-2 align-middle text-[11px] text-body">
                  {item.colorName ?? '—'}
                </td>
                <td className="px-3 py-2 align-middle text-[11px] text-body">
                  {item.sizeLabel ?? '—'}
                </td>
                <td className="px-3 py-2 align-middle text-right text-[11px] text-body">
                  {item.quantity}
                </td>
                <td className="px-3 py-2 align-middle text-right text-[11px] text-body">
                  {formatBRL(item.unitPrice)}
                </td>
                <td className="px-3 py-2 align-middle text-right text-xs font-semibold text-heading">
                  {formatBRL(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-edge md:hidden">
        {items.map((item) => (
          <li
            key={item.itemId}
            className="flex items-center gap-3 px-3 py-3"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="h-12 w-12 flex-shrink-0 rounded-xl border border-edge object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-alt text-[10px] font-semibold uppercase tracking-wide text-faint">
                {item.skuCode?.slice(0, 4) ?? 'SKU'}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-heading">
                {item.productName}
              </span>
              <span className="text-[11px] text-muted">
                {[item.colorName, item.sizeLabel].filter(Boolean).join(' · ') ||
                  'Variação única'}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                {item.skuCode}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted">
                {item.quantity} × {formatBRL(item.unitPrice)}
              </span>
              <span className="text-sm font-semibold text-heading">
                {formatBRL(item.subtotal)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
