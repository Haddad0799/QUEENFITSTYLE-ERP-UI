const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const DATE_LONG = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const DATE_SHORT = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

export const formatBRL = (value: number | null | undefined) =>
  BRL.format(typeof value === 'number' ? value : 0);

export const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return DATE_LONG.format(d);
};

export const formatDateShort = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return DATE_SHORT.format(d);
};

export const formatPhone = (raw: string | null | undefined) => {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
};
