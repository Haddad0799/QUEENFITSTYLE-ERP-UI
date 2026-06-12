import type { StockMovementDTO } from '../../types/stock';
import { formatDateTime } from '../../lib/format';

const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  INBOUND: 'Abastecimento',
  OUTBOUND: 'Saída por pedido',
  ADJUSTMENT: 'Ajuste',
  RESERVATION: 'Reserva',
  RELEASE: 'Liberação',
};

/** Tipos que sempre reduzem ou aumentam o disponível, independente do sinal vindo da API. */
const DECREASE_TYPES = new Set(['OUTBOUND', 'RESERVATION']);
const INCREASE_TYPES = new Set(['INBOUND', 'RELEASE']);

const signedQuantity = (movement: StockMovementDTO) => {
  if (DECREASE_TYPES.has(movement.type)) return -Math.abs(movement.quantity);
  if (INCREASE_TYPES.has(movement.type)) return Math.abs(movement.quantity);
  return movement.quantity;
};

type Props = {
  movements: StockMovementDTO[] | null;
  isLoading: boolean;
  error: string | null;
};

export function StockMovementsPanel({ movements, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-[11px] text-muted">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-edge-strong border-t-brand" />
        Carregando movimentações…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4 text-[11px] text-danger">{error}</div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="px-4 py-4 text-[11px] text-muted">
        Nenhuma movimentação registrada para este SKU.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        Movimentações
      </span>
      <ul className="divide-y divide-edge">
        {movements.map((movement, index) => {
          const quantity = signedQuantity(movement);
          const quantityClass =
            quantity > 0
              ? 'text-emerald-600 dark:text-emerald-300'
              : quantity < 0
                ? 'text-rose-600 dark:text-rose-300'
                : 'text-muted';
          return (
            <li
              key={index}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[11px]"
            >
              <span className="min-w-[120px] font-medium text-heading">
                {MOVEMENT_TYPE_LABEL[movement.type] ?? movement.type}
              </span>
              <span className={`w-12 font-semibold tabular-nums ${quantityClass}`}>
                {quantity > 0 ? `+${quantity}` : quantity}
              </span>
              {movement.reason && (
                <span className="flex-1 text-body">{movement.reason}</span>
              )}
              <span className="ml-auto text-faint">
                {formatDateTime(movement.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
