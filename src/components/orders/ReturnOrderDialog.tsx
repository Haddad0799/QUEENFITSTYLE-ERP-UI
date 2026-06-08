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

export function ReturnOrderDialog({
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
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
            ↩
          </span>
          <h3 className="text-sm font-semibold text-heading">
            Registrar devolução #{order.orderId}
          </h3>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-label">
          O pedido de{' '}
          <span className="font-semibold text-heading">{customerName}</span> será
          marcado como <span className="font-semibold">DEVOLVIDO</span> e o
          estoque dos itens será reposto. Use para devoluções ou trocas.
        </p>

        <label className="mb-1 mt-3 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Motivo (opcional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: troca de tamanho, produto com defeito..."
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
            Voltar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(reason)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-[11px] font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Registrando…' : 'Confirmar devolução'}
          </button>
        </div>
      </div>
    </div>
  );
}
