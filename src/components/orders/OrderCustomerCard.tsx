import type { OrderCustomerDTO } from '../../types/orders';
import { formatPhone } from '../../lib/format';

type Props = {
  customer: OrderCustomerDTO;
};

const buildWhatsappUrl = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  /**
   * Heurística para DDI: telefones brasileiros costumam vir com 10-11
   * dígitos sem código do país. Quando for esse caso, prefixamos 55. Se
   * já vier com mais dígitos, assumimos que o DDI já está embutido.
   */
  const normalized = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${normalized}`;
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
            <span>💬</span> Abrir WhatsApp
          </a>
        )}
      </header>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-sm font-semibold text-white shadow-lg shadow-pink-500/20">
          {customer.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-heading">
            {customer.name}
          </span>
          <span className="text-[11px] text-muted">
            {formatPhone(customer.phone)}
          </span>
          {customer.city && (
            <span className="text-[11px] text-muted">📍 {customer.city}</span>
          )}
        </div>
      </div>
    </section>
  );
}
