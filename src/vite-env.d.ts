/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base da API. Vazio em dev (usa o proxy do Vite); em produção aponta
   * para o backend público (Railway).
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
