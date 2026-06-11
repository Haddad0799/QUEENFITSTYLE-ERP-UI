import type { OrderCustomerDTO } from '../../types/orders';
import { formatPhone } from '../../lib/format';
import { MailIcon, MapPinIcon, MessageCircleIcon } from '../icons';

type Props = {
  customer: OrderCustomerDTO;
};

const buildWhatsappUrl = (phone: string) => {
  // Remove todos os caracteres não numéricos (parênteses, espaços, hífens)
  // antes de montar o link, evitando URLs inválidas no wa.me.
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
};

export function OrderCustomerCard({ customer }: Props) {
  const whatsappUrl = buildWhatsappUrl(customer.phone);

  return (
    <section className="rounded-2xl border border-edge bg-surface p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Cliente
        </h2>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
          >
            <MessageCircleIcon className="h-3.5 w-3.5" /> Abrir WhatsApp
          </a>
        )}
      </header>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#a0673a] to-[#c9956a] text-sm font-semibold text-white shadow-lg shadow-black/20">
          {customer.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-heading">
            {customer.name}
          </span>
          <span className="text-[11px] text-muted">
            {formatPhone(customer.phone)}
          </span>
          {customer.email && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <MailIcon className="h-3 w-3 flex-shrink-0" /> {customer.email}
            </span>
          )}
          {customer.city && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <MapPinIcon className="h-3 w-3 flex-shrink-0" /> {customer.city}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
