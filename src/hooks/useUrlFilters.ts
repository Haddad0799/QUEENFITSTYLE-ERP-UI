import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type UrlFilterValue = string | number;

/**
 * Sincroniza um conjunto de filtros/paginação com os query params da URL.
 *
 * A URL é a fonte da verdade: aplicar um filtro reflete na query string e
 * voltar de uma tela de detalhe (ou dar refresh) restaura o estado a partir
 * dela. Valores iguais ao default são omitidos da URL para mantê-la limpa.
 *
 * As atualizações usam `replace`, então o histórico não acumula uma entrada
 * por filtro digitado — o botão voltar do navegador retorna à listagem (com
 * seus filtros preservados) em vez de desfazer filtro a filtro.
 *
 * Os tipos e as chaves vêm do objeto `defaults`. Use a forma genérica
 * explícita para preservar uniões (ex.: `useUrlFilters<MeuEstado>({...})`).
 */
export function useUrlFilters<T extends Record<string, UrlFilterValue>>(
  defaults: T,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Os defaults definem chaves e tipos; capturamos uma vez (lazy state) para
  // manter as funções estáveis mesmo que o objeto literal mude de identidade.
  const [initialDefaults] = useState(() => defaults);

  const parse = useCallback(
    (params: URLSearchParams): T => {
      const result = { ...initialDefaults } as T;
      for (const key of Object.keys(initialDefaults) as (keyof T)[]) {
        const raw = params.get(String(key));
        if (raw === null || raw === '') continue;
        const def = initialDefaults[key];
        if (typeof def === 'number') {
          const parsed = Number(raw);
          result[key] = (Number.isNaN(parsed) ? def : parsed) as T[keyof T];
        } else {
          result[key] = raw as T[keyof T];
        }
      }
      return result;
    },
    [initialDefaults],
  );

  const serialize = useCallback(
    (values: T): URLSearchParams => {
      const params = new URLSearchParams();
      for (const key of Object.keys(initialDefaults) as (keyof T)[]) {
        const value = values[key];
        const def = initialDefaults[key];
        // Omite vazios e defaults para não sujar a URL.
        if (value === undefined || value === null || value === '' || value === def) {
          continue;
        }
        params.set(String(key), String(value));
      }
      return params;
    },
    [initialDefaults],
  );

  const values = useMemo(() => parse(searchParams), [parse, searchParams]);

  /** Mescla um patch sobre o estado atual da URL. Inclua `page: 0` ao trocar um filtro. */
  const setValues = useCallback(
    (patch: Partial<T>) => {
      setSearchParams((prev) => serialize({ ...parse(prev), ...patch } as T), {
        replace: true,
      });
    },
    [parse, serialize, setSearchParams],
  );

  /** Limpa todos os filtros e a paginação (volta aos defaults). */
  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { values, setValues, reset };
}
