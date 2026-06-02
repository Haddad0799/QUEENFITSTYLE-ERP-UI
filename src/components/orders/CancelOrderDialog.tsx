import { useEffect, useState } from 'react';
import type { OrderDetailsDTO, OrderSummaryDTO } from '../../types/orders';

type Props = {
  open: boolean;
  order: OrderDetailsDTO | OrderSummaryDTO | null;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export function CancelOrderDialog({
  open,
  order,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!open || !order) return null;

  const customerName =
    'customer' in order ? order.customer.name : order.customerName;

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
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
            !
          </span>
          <h3 className="text-sm font-semibold text-heading">
            Cancelar pedido #{order.orderId}
          </h3>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-label">
          O cliente <span className="font-semibold text-heading">{customerName}</span>{' '}
          terá o pedido cancelado e as reservas de estoque liberadas. Esta ação
          não pode ser desfeita.
        </p>

        <label className="mb-1 mt-3 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Motivo (opcional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: cliente desistiu, estoque indisponível..."
          className="w-full resize-none rounded-xl border border-edge-strong bg-surface-input px-3 py-2 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          disabled={isSubmitting}
        />

        {error && (
          <div className="mt-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
          >
            Manter pedido
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(reason)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger-edge bg-danger-action px-3 text-[11px] font-semibold text-white shadow hover:bg-danger-action/90 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Cancelando…' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
