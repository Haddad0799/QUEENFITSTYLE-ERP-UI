import type { OrderDetailsDTO } from '../../types/orders';
import { formatBRL, formatDateTime } from '../../lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ReservationCountdown } from './ReservationCountdown';
import { ReservationStatusBadge } from './ReservationStatusBadge';

type Props = {
  order: OrderDetailsDTO;
};

export function OrderDetailsCard({ order }: Props) {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <section className="rounded-2xl border border-edge bg-surface p-4 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Pedido
          </span>
          <h2 className="text-xl font-semibold text-heading">
            #{order.orderId}
          </h2>
          <span className="text-[11px] text-faint">
            Criado em {formatDateTime(order.createdAt)}
          </span>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <span className="text-[11px] text-faint">
              Atualizado em {formatDateTime(order.updatedAt)}
            </span>
          )}
          {order.expiresAt && order.status === 'WAITING_SELLER_CONFIRMATION' && (
            <div className="mt-1">
              <ReservationCountdown expiresAt={order.expiresAt} />
            </div>
          )}
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </header>

      <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
        <Stat label="Itens" value={String(totalQuantity)} />
        <Stat label="Subtotal" value={formatBRL(itemsTotal)} />
        <Stat label="Total" value={formatBRL(order.totalAmount)} highlight />
      </dl>

      {order.notes && (
        <div className="mt-4 rounded-xl border border-edge bg-surface-alt p-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Observações
          </span>
          <p className="mt-1 whitespace-pre-wrap text-xs text-body">
            {order.notes}
          </p>
        </div>
      )}

      {order.reservations.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
              Reservas de estoque
            </span>
            <span className="text-[10px] text-faint">
              {order.reservations.length} item(ns) reservado(s)
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-edge">
            <table className="min-w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-surface-alt text-left text-[10px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-3 py-2 font-semibold">SKU</th>
                  <th className="px-3 py-2 text-right font-semibold">Qtd</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Reserva</th>
                  <th className="px-3 py-2 font-semibold">Expira em</th>
                </tr>
              </thead>
              <tbody>
                {order.reservations.map((res) => (
                  <tr key={res.reservationId} className="border-t border-edge">
                    <td className="px-3 py-2">
                      <span className="font-mono text-[11px] font-medium text-heading">
                        {res.skuCode}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-body">
                      {res.quantity}
                    </td>
                    <td className="px-3 py-2">
                      <ReservationStatusBadge status={res.status} />
                    </td>
                    <td className="px-3 py-2 text-[10px] text-faint">
                      {res.reservationId.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-2">
                      {res.status === 'RESERVED' && res.expiresAt ? (
                        <ReservationCountdown
                          expiresAt={res.expiresAt}
                          size="xs"
                        />
                      ) : res.expiresAt ? (
                        <span className="text-[11px] text-muted">
                          {formatDateTime(res.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-edge bg-surface-alt px-3 py-2.5">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-semibold ${
          highlight ? 'text-brand' : 'text-heading'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
