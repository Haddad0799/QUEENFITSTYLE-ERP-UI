import { useNavigate } from 'react-router-dom';
import type { OrderSummaryDTO } from '../../types/orders';
import { formatBRL, formatDateShort, formatPhone } from '../../lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ReservationCountdown } from './ReservationCountdown';
import { ActionsMenu, type ActionItem } from './ActionsMenu';
import {
  CheckIcon,
  ClockIcon,
  FlagIcon,
  InboxIcon,
  MailIcon,
  MapPinIcon,
  RotateCcwIcon,
  XIcon,
} from '../icons';

type Props = {
  items: OrderSummaryDTO[];
  isLoading: boolean;
  error: string | null;
  onConfirm?: (order: OrderSummaryDTO) => void;
  onCancel?: (order: OrderSummaryDTO) => void;
  onExpire?: (order: OrderSummaryDTO) => void;
  onDeliver?: (order: OrderSummaryDTO) => void;
  onReturn?: (order: OrderSummaryDTO) => void;
};

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="border-t border-edge">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 w-full max-w-[120px] animate-pulse rounded bg-surface-alt" />
      </td>
    ))}
  </tr>
);

const buildActions = (
  order: OrderSummaryDTO,
  onConfirm?: (o: OrderSummaryDTO) => void,
  onCancel?: (o: OrderSummaryDTO) => void,
  onExpire?: (o: OrderSummaryDTO) => void,
  onDeliver?: (o: OrderSummaryDTO) => void,
  onReturn?: (o: OrderSummaryDTO) => void,
): ActionItem[] => {
  const isPending = order.status === 'PENDING_PAYMENT';
  const isPaid = order.status === 'PAID';
  const canReturn = order.status === 'PAID' || order.status === 'DELIVERED';
  const actions: ActionItem[] = [];

  if (isPending && onConfirm) {
    actions.push({
      key: 'confirm',
      label: 'Confirmar pagamento',
      icon: CheckIcon,
      onSelect: () => onConfirm(order),
    });
  }
  if (isPending && onCancel) {
    actions.push({
      key: 'cancel',
      label: 'Cancelar pedido',
      icon: XIcon,
      destructive: true,
      onSelect: () => onCancel(order),
    });
  }
  if (isPending && onExpire) {
    actions.push({
      key: 'expire',
      label: 'Expirar pedido',
      icon: ClockIcon,
      onSelect: () => onExpire(order),
    });
  }
  if (isPaid && onDeliver) {
    actions.push({
      key: 'deliver',
      label: 'Marcar como entregue',
      icon: FlagIcon,
      onSelect: () => onDeliver(order),
    });
  }
  if (canReturn && onReturn) {
    actions.push({
      key: 'return',
      label: 'Registrar devolução',
      icon: RotateCcwIcon,
      onSelect: () => onReturn(order),
    });
  }

  return actions;
};

export function OrderTable({
  items,
  isLoading,
  error,
  onConfirm,
  onCancel,
  onExpire,
  onDeliver,
  onReturn,
}: Props) {
  const navigate = useNavigate();

  const isEmpty = !isLoading && !error && items.length === 0;
  const colCount = 9;

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 text-left font-semibold">Pedido</th>
              <th className="px-4 py-3 text-left font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left font-semibold">Telefone</th>
              <th className="px-4 py-3 text-right font-semibold">Itens</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Criado em</th>
              <th className="px-4 py-3 text-left font-semibold">
                Reservas
              </th>
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
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-faint">
                      <InboxIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-heading">
                      Nenhum pedido encontrado
                    </span>
                    <span className="text-[11px] text-faint">
                      Ajuste os filtros ou aguarde novos pedidos chegarem.
                    </span>
                  </div>
                </td>
              </tr>
            )}
            {items.map((order) => {
              const actions = buildActions(
                order,
                onConfirm,
                onCancel,
                onExpire,
                onDeliver,
                onReturn,
              );
              const showCountdown =
                order.status === 'PENDING_PAYMENT' &&
                Boolean(order.expiresAt);
              return (
                <tr
                  key={order.orderId}
                  className="cursor-pointer border-t border-edge transition-colors hover:bg-surface-alt"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                >
                  <td className="px-4 py-3 align-middle">
                    <span className="text-sm font-semibold text-heading">
                      #{order.orderId}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-xs text-body">
                    <div className="flex flex-col gap-0.5">
                      <span>{order.customerName}</span>
                      {order.customerEmail && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                          <MailIcon className="h-3 w-3 flex-shrink-0" />
                          {order.customerEmail}
                        </span>
                      )}
                      {order.deliveryAddress?.city && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                          <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                          {[order.deliveryAddress.city, order.deliveryAddress.state]
                            .filter(Boolean)
                            .join(' / ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-xs text-body">
                    {formatPhone(order.customerPhone)}
                  </td>
                  <td className="px-4 py-3 align-middle text-right text-xs text-body">
                    {order.itemsCount}
                  </td>
                  <td className="px-4 py-3 align-middle text-right text-xs font-semibold text-heading">
                    {formatBRL(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 align-middle text-[11px] text-muted">
                    {formatDateShort(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {showCountdown ? (
                      <ReservationCountdown
                        expiresAt={order.expiresAt}
                        size="xs"
                      />
                    ) : (
                      <span className="text-[11px] text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
                      >
                        Detalhes
                      </button>
                      {actions.length > 0 && (
                        <ActionsMenu items={actions} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-edge md:hidden">
        {isLoading && items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted">
            Carregando pedidos...
          </div>
        )}
        {!isLoading && error && (
          <div className="px-4 py-8 text-center text-sm text-danger">
            {error}
          </div>
        )}
        {isEmpty && (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-faint">
                <InboxIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-heading">
                Nenhum pedido encontrado
              </span>
              <span className="text-[11px] text-faint">
                Ajuste os filtros ou aguarde novos pedidos chegarem.
              </span>
            </div>
          </div>
        )}
        {items.map((order) => {
          const showCountdown =
            order.status === 'PENDING_PAYMENT' && Boolean(order.expiresAt);
          return (
            <button
              key={order.orderId}
              type="button"
              onClick={() => navigate(`/orders/${order.orderId}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt active:bg-surface-alt"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold text-brand">
                #{order.orderId}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium text-heading">
                  {order.customerName}
                </span>
                <span className="text-[11px] text-muted">
                  {formatPhone(order.customerPhone)} · {order.itemsCount} item(ns)
                </span>
                {order.customerEmail && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                    <MailIcon className="h-3 w-3 flex-shrink-0" />
                    {order.customerEmail}
                  </span>
                )}
                {order.deliveryAddress?.city && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                    <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                    {[order.deliveryAddress.city, order.deliveryAddress.state]
                      .filter(Boolean)
                      .join(' / ')}
                  </span>
                )}
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} compact />
                  <span className="text-[11px] text-faint">
                    {formatDateShort(order.createdAt)}
                  </span>
                  {showCountdown && (
                    <ReservationCountdown
                      expiresAt={order.expiresAt}
                      size="xs"
                    />
                  )}
                </div>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold text-heading">
                {formatBRL(order.totalAmount)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
