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

export const formatCep = (raw: string | null | undefined) => {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return raw;
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

/**
 * Código do país do Brasil. É a única parte constante de um número de WhatsApp —
 * o DDD varia por região e nunca deve ser assumido fixo.
 */
export const PHONE_COUNTRY_CODE = '55';

/** Número local esperado: DDD (2 dígitos) + celular (9 dígitos). */
export const LOCAL_PHONE_LENGTH = 11;

/** Apenas os dígitos locais (DDD + número), limitados ao tamanho esperado. */
export const localPhoneDigits = (raw: string) =>
  raw.replace(/\D/g, '').slice(0, LOCAL_PHONE_LENGTH);

/**
 * Remove o código do país de um número completo vindo do backend
 * (ex.: 5561983770131 → 61983770131), retornando só os dígitos locais.
 * Só corta o prefixo quando o tamanho bate com 55 + número local, para não
 * confundir com um DDD que por acaso comece com 55.
 */
export const stripPhoneCountryCode = (raw: string | null | undefined) => {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (
    digits.startsWith(PHONE_COUNTRY_CODE) &&
    digits.length === PHONE_COUNTRY_CODE.length + LOCAL_PHONE_LENGTH
  ) {
    return digits.slice(PHONE_COUNTRY_CODE.length);
  }
  return digits;
};

/**
 * Aplica a máscara brasileira (DD) XXXXX-XXXX progressivamente durante a
 * digitação, aceitando entrada com ou sem formatação.
 */
export const maskLocalPhone = (raw: string) => {
  const digits = localPhoneDigits(raw);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/** Verdadeiro quando há DDD (2) + celular (9) = 11 dígitos locais. */
export const isValidLocalPhone = (raw: string) =>
  localPhoneDigits(raw).length === LOCAL_PHONE_LENGTH;

/** Monta o número completo com o código do país para enviar ao backend. */
export const withPhoneCountryCode = (raw: string) =>
  `${PHONE_COUNTRY_CODE}${localPhoneDigits(raw)}`;
