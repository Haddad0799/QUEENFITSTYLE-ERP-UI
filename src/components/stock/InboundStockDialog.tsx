import { useState } from 'react';
import type { StockOverviewDTO } from '../../types/stock';
import { PackageIcon } from '../icons';

type Props = {
  sku: StockOverviewDTO;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
};

/**
 * Deve ser montado condicionalmente pelo pai (`{target && <InboundStockDialog/>}`)
 * para que o estado do formulário zere a cada abertura.
 */
export function InboundStockDialog({
  sku,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [quantity, setQuantity] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    const value = parseInt(quantity, 10);
    if (!Number.isInteger(value) || value <= 0) {
      setValidationError('Informe uma quantidade válida (maior que zero).');
      return;
    }
    setValidationError(null);
    onConfirm(value);
  };

  const variant = [sku.colorName, sku.sizeName].filter(Boolean).join(' · ');

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
            <PackageIcon className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-heading">
            Abastecer estoque
          </h3>
        </div>
        <p className="mb-4 text-[11px] leading-relaxed text-label">
          Registrar entrada de estoque para{' '}
          <span className="font-semibold text-heading">{sku.productName}</span>
          {variant && <> ({variant})</>} — SKU{' '}
          <span className="font-semibold text-heading">{sku.skuCode}</span>.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-1"
        >
          <label
            htmlFor="inbound-quantity"
            className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
          >
            Quantidade recebida
          </label>
          <input
            id="inbound-quantity"
            type="number"
            min={1}
            step={1}
            autoFocus
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ex.: 10"
            className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </form>

        {(validationError || error) && (
          <div className="mt-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
            {validationError ?? error}
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
            onClick={handleSubmit}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Registrando…' : 'Confirmar entrada'}
          </button>
        </div>
      </div>
    </div>
  );
}
