import { useCallback } from 'react';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';

/**
 * Mecanismo unificado para preservar página e filtros ao ir de uma listagem
 * paginada para uma tela de detalhe e voltar.
 *
 * A listagem já mantém seu estado na URL (ver `useUrlFilters`). Aqui guardamos
 * essa URL completa (pathname + query string) no `location.state` ao abrir o
 * detalhe, e o detalhe usa esse valor para voltar exatamente de onde veio —
 * em vez de um caminho fixo que descartaria os query params.
 */
const LIST_URL_STATE_KEY = 'listUrl';

type StateObject = Record<string, unknown>;

/**
 * Lado da listagem: navega para uma tela de detalhe guardando a URL atual
 * (com página e filtros) no histórico. Preserva qualquer `state` extra passado
 * pela chamada (ex.: nome do produto no estoque).
 */
export function useOpenDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const listUrl = location.pathname + location.search;

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      navigate(to, {
        ...options,
        state: {
          ...(options?.state as StateObject | undefined),
          [LIST_URL_STATE_KEY]: listUrl,
        },
      });
    },
    [navigate, listUrl],
  );
}

/**
 * Lado do detalhe: devolve uma função "voltar" que restaura a listagem de
 * origem (página + filtros) lida do `location.state`. Sem origem conhecida
 * (acesso direto ao detalhe ou refresh), cai no `fallback` — a rota base.
 */
export function useReturnToList(fallback: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const listUrl = (location.state as StateObject | null)?.[LIST_URL_STATE_KEY];

  return useCallback(() => {
    navigate(typeof listUrl === 'string' ? listUrl : fallback);
  }, [navigate, listUrl, fallback]);
}
