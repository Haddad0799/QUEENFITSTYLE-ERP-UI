// Em desenvolvimento, deixe VITE_API_BASE_URL vazio/ausente para usar o proxy
// do Vite (ver vite.config.ts). Em produção (Vercel), defina a variável com a
// URL pública do backend no Railway, ex.: https://seu-backend.up.railway.app
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const DEFAULT_PAGE_SIZE = 10;

