import { useEffect, useState } from 'react';

/**
 * Retorna o timestamp atual, atualizado em `intervalMs` (default 30s).
 * Útil para componentes de contagem regressiva (ex.: expiração de
 * reservas) que devem re-renderizar sem precisar de refetch da API.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
