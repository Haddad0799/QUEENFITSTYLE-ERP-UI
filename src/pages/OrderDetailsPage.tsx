import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderCustomerCard } from '../components/orders/OrderCustomerCard';
import { OrderDetailsCard } from '../components/orders/OrderDetailsCard';
import { OrderItemsList } from '../components/orders/OrderItemsList';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { CancelOrderDialog } from '../components/orders/CancelOrderDialog';
import { ExpireOrderDialog } from '../components/orders/ExpireOrderDialog';
import { useOrder } from '../hooks/orders/useOrder';
import { useOrderTimeline } from '../hooks/orders/useOrderTimeline';
import {
  applyActionResult,
  useOrderActions,
} from '../hooks/orders/useOrderActions';
import { useToast } from '../components/toast/ToastProvider';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const orderId = id ? Number(id) : null;
  const isValidId = orderId !== null && !Number.isNaN(orderId);

  const {
    data: order,
    isLoading,
    error,
    refetch: refetchOrder,
    setOrder,
  } = useOrder(isValidId ? orderId : null);

  const {
    events: timelineEvents,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useOrderTimeline(isValidId ? orderId : null);

  const actions = useOrderActions({
    onOptimisticUpdate: (updater) => {
      setOrder(order ? updater(order) : order);
    },
    onResolved: (result) => {
      setOrder(applyActionResult(order, result));
      refetchTimeline();
    },
    onRollback: (previous) => {
      setOrder(previous);
    },
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showExpireDialog, setShowExpireDialog] = useState(false);

  const handleConfirm = async () => {
    if (!order) return;
    const res = await actions.confirm(order);
    if (res.ok) {
      toast.success(
        `Pedido #${order.orderId} confirmado`,
        'A venda foi marcada como confirmada.',
      );
      setShowConfirmDialog(false);
    } else {
      toast.error('Não foi possível confirmar', res.error);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!order) return;
    const res = await actions.cancel(order, reason);
    if (res.ok) {
      toast.success(
        `Pedido #${order.orderId} cancelado`,
        'As reservas de estoque foram liberadas.',
      );
      setShowCancelDialog(false);
    } else {
      toast.error('Erro ao cancelar pedido', res.error);
    }
  };

  const handleExpire = async () => {
    if (!order) return;
    const res = await actions.expire(order);
    if (res.ok) {
      toast.success(
        `Pedido #${order.orderId} expirado`,
        'As reservas foram liberadas para venda.',
      );
      setShowExpireDialog(false);
    } else {
      toast.error('Erro ao expirar pedido', res.error);
    }
  };

  if (!isValidId) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        Pedido inválido.
      </div>
    );
  }

  if (isLoading && !order) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-alt" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-44 animate-pulse rounded-2xl border border-edge bg-surface" />
          <div className="h-44 animate-pulse rounded-2xl border border-edge bg-surface" />
          <div className="h-44 animate-pulse rounded-2xl border border-edge bg-surface" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-edge bg-surface" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex w-fit items-center gap-1.5 text-[11px] text-muted hover:text-heading"
        >
          ← Voltar para pedidos
        </button>
        <div className="rounded-xl border border-danger-edge bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  /**
   * Regras operacionais por status:
   * - WAITING_SELLER_CONFIRMATION → pode confirmar, cancelar, expirar
   * - CONFIRMED, PREPARING, SHIPPED, DELIVERED → somente leitura para
   *   este ERP (transições de logística serão expostas em outro endpoint)
   * - CANCELLED, EXPIRED → somente leitura
   */
  const canMutate = order.status === 'WAITING_SELLER_CONFIRMATION';
  const isReadOnly =
    order.status === 'CANCELLED' || order.status === 'EXPIRED';

  /**
   * Preferimos os eventos do endpoint dedicado (mais novos após mutations).
   * Se ainda não carregaram, caímos no `timeline` que já vem embutido no
   * detalhe — UX sem flicker.
   */
  const timelineToRender = timelineEvents ?? order.timeline;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex w-fit items-center gap-1.5 text-[11px] text-muted transition hover:text-heading"
          >
            ← Pedidos
          </button>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Detalhes do pedido
          </h1>
          {isReadOnly && (
            <span className="text-[11px] text-muted">
              Pedido finalizado — apenas leitura.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refetchOrder();
              refetchTimeline();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface-alt px-3 py-2 text-[11px] font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98]"
          >
            ↻ Atualizar
          </button>

          {canMutate && (
            <>
              <button
                type="button"
                disabled={actions.isBusy}
                onClick={() => setShowExpireDialog(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-edge-strong bg-surface px-3 py-2 text-[11px] font-semibold text-heading shadow-sm transition hover:border-gray-400 active:scale-[0.98] disabled:opacity-50"
              >
                ⏱ Expirar pedido
              </button>
              <button
                type="button"
                disabled={actions.isBusy}
                onClick={() => setShowCancelDialog(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-edge-strong bg-surface px-3 py-2 text-[11px] font-semibold text-heading shadow-sm transition hover:border-danger-action hover:text-danger active:scale-[0.98] disabled:opacity-50"
              >
                ✕ Cancelar pedido
              </button>
              <button
                type="button"
                disabled={actions.isBusy}
                onClick={() => setShowConfirmDialog(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-[11px] font-semibold text-white shadow shadow-emerald-500/30 transition hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50"
              >
                ✓ Confirmar venda
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrderDetailsCard order={order} />
        </div>
        <div className="flex flex-col gap-4">
          <OrderCustomerCard customer={order.customer} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Itens do pedido
          </h2>
          <OrderItemsList items={order.items} />
        </section>

        <section className="rounded-2xl border border-edge bg-surface p-4 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Linha do tempo
          </h2>
          <OrderTimeline
            events={timelineToRender}
            isLoading={isTimelineLoading && !timelineToRender}
            error={timelineError}
          />
        </section>
      </div>

      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !actions.isConfirming && setShowConfirmDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-edge bg-surface p-5 text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                ✓
              </span>
              <h3 className="text-sm font-semibold text-heading">
                Confirmar venda #{order.orderId}
              </h3>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-label">
              Marcar pedido de{' '}
              <span className="font-semibold text-heading">
                {order.customer.name}
              </span>{' '}
              como confirmado. O estoque das reservas será baixado oficialmente.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={actions.isConfirming}
                onClick={() => setShowConfirmDialog(false)}
                className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={actions.isConfirming}
                onClick={handleConfirm}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
              >
                {actions.isConfirming && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {actions.isConfirming ? 'Confirmando…' : 'Confirmar venda'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CancelOrderDialog
        open={showCancelDialog}
        order={order}
        isSubmitting={actions.isCancelling}
        error={actions.actionError}
        onClose={() => {
          setShowCancelDialog(false);
          actions.clearError();
        }}
        onConfirm={handleCancel}
      />

      <ExpireOrderDialog
        open={showExpireDialog}
        order={order}
        isSubmitting={actions.isExpiring}
        error={actions.actionError}
        onClose={() => {
          setShowExpireDialog(false);
          actions.clearError();
        }}
        onConfirm={handleExpire}
      />
    </div>
  );
}
