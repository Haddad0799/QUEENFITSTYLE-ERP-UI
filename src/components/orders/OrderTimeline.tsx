import type { ComponentType } from 'react';
import type {
  OrderTimelineEventDTO,
  OrderTimelineEventType,
} from '../../types/orders';
import { formatDateTime } from '../../lib/format';
import {
  CheckIcon,
  CircleIcon,
  ClockIcon,
  FlagIcon,
  MessageCircleIcon,
  NoteIcon,
  PackageIcon,
  RotateCcwIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  XIcon,
} from '../icons';

type IconComponent = ComponentType<{ className?: string }>;

type EventMeta = {
  label: string;
  icon: IconComponent;
  dot: string;
  ring: string;
};

const EVENT_META: Record<string, EventMeta> = {
  ORDER_CREATED: {
    label: 'Pedido criado',
    icon: ShoppingCartIcon,
    dot: 'bg-brand text-on-brand',
    ring: 'ring-brand/30',
  },
  WHATSAPP_OPENED: {
    label: 'Cliente redirecionado para o WhatsApp',
    icon: MessageCircleIcon,
    dot: 'bg-emerald-500 text-white',
    ring: 'ring-emerald-500/30',
  },
  PAID: {
    label: 'Pagamento confirmado',
    icon: CheckIcon,
    dot: 'bg-emerald-500 text-white',
    ring: 'ring-emerald-500/30',
  },
  DELIVERED: {
    label: 'Pedido entregue',
    icon: FlagIcon,
    dot: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-500/30',
  },
  CANCELLED: {
    label: 'Pedido cancelado',
    icon: XIcon,
    dot: 'bg-rose-500 text-white',
    ring: 'ring-rose-500/30',
  },
  EXPIRED: {
    label: 'Pedido expirado',
    icon: ClockIcon,
    dot: 'bg-gray-400 text-white dark:bg-gray-500',
    ring: 'ring-gray-400/30',
  },
  RETURNED: {
    label: 'Pedido devolvido',
    icon: RotateCcwIcon,
    dot: 'bg-orange-500 text-white',
    ring: 'ring-orange-500/30',
  },
  RESERVATIONS_CONFIRMED: {
    label: 'Reservas confirmadas (estoque baixado)',
    icon: TrendingDownIcon,
    dot: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-500/30',
  },
  RESERVATIONS_RELEASED: {
    label: 'Reservas liberadas',
    icon: RotateCcwIcon,
    dot: 'bg-blue-500 text-white',
    ring: 'ring-blue-500/30',
  },
  RESERVATIONS_RETURNED: {
    label: 'Estoque reposto',
    icon: PackageIcon,
    dot: 'bg-orange-500 text-white',
    ring: 'ring-orange-500/30',
  },
  NOTE_ADDED: {
    label: 'Observação adicionada',
    icon: NoteIcon,
    dot: 'bg-surface-alt text-heading',
    ring: 'ring-edge',
  },
};

const FALLBACK_META: EventMeta = {
  label: 'Evento',
  icon: CircleIcon,
  dot: 'bg-surface-alt text-heading',
  ring: 'ring-edge',
};

const humanize = (eventType: OrderTimelineEventType) =>
  eventType
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

type Props = {
  events: OrderTimelineEventDTO[] | null;
  isLoading: boolean;
  error: string | null;
};

export function OrderTimeline({ events, isLoading, error }: Props) {
  if (isLoading && !events) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-7 w-7 flex-shrink-0 animate-pulse rounded-full bg-surface-alt" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-alt" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-alt" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
        {error}
      </div>
    );
  }

  const list = events ?? [];
  if (list.length === 0) {
    return (
      <div className="text-[11px] text-muted">
        Nenhum evento registrado ainda.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-edge pl-5">
      {list.map((event) => (
        <TimelineItem key={event.eventId} event={event} />
      ))}
    </ol>
  );
}

function TimelineItem({ event }: { event: OrderTimelineEventDTO }) {
  const meta = EVENT_META[event.eventType] ?? {
    ...FALLBACK_META,
    label: humanize(event.eventType),
  };
  const Icon = meta.icon;
  return (
    <li className="relative">
      <span
        className={`absolute -left-[34px] top-0 inline-flex h-7 w-7 items-center justify-center rounded-full ring-4 ${meta.dot} ${meta.ring}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-heading">{meta.label}</span>
        <span className="text-[11px] text-muted">{formatDateTime(event.createdAt)}</span>
        {event.actor && (
          <span className="text-[11px] text-faint">por {event.actor}</span>
        )}
        {event.description && (
          <p className="mt-1 rounded-lg border border-edge bg-surface-alt px-2.5 py-1.5 text-[11px] text-body">
            {event.description}
          </p>
        )}
      </div>
    </li>
  );
}
