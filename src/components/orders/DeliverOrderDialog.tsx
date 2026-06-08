import type { OrderDetailsDTO, OrderSummaryDTO } from '../../types/orders';
import { FlagIcon } from '../icons';

type Props = {
  open: boolean;
  order: OrderDetailsDTO | OrderSummaryDTO | null;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeliverOrderDialog({
  open,
  order,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}: Props) {
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
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <FlagIcon className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-heading">
            Marcar como entregue #{order.orderId}
          </h3>
        </div>
        <p className="mb-4 text-[11px] leading-relaxed text-label">
          Confirmar que o pedido de{' '}
          <span className="font-semibold text-heading">{customerName}</span> foi
          entregue ao cliente. O pedido passará para{' '}
          <span className="font-semibold">ENTREGUE</span>.
        </p>

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
            onClick={onConfirm}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Confirmando…' : 'Confirmar entrega'}
          </button>
        </div>
      </div>
    </div>
  );
}
