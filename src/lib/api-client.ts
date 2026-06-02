import { API_BASE_URL } from '../config';

export type Pageable = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * Erros que carregam o status HTTP — útil para o AuthProvider decidir se
 * deve forçar logout (401) sem precisar parsear a mensagem.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const AUTH_TOKEN_STORAGE_KEY = 'qf:auth:token';
export const AUTH_UNAUTHORIZED_EVENT = 'qf:auth:unauthorized';

const PUBLIC_PATH_PREFIXES = ['/auth/login'];

const isPublicPath = (path: string) =>
  PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

const readToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const clearToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // ambiente sem storage — apenas ignoramos
  }
};

const buildHeaders = (
  path: string,
  extra: Record<string, string> = {},
  includeJson = true,
): HeadersInit => {
  const headers: Record<string, string> = { ...extra };
  if (includeJson) headers['Content-Type'] = 'application/json';
  const token = readToken();
  if (token && !isPublicPath(path)) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else if (typeof value === 'object') {
      search.append(key, JSON.stringify(value));
    } else {
      search.append(key, String(value));
    }
  });

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
};

async function handleResponse<T>(
  response: Response,
  path: string,
): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let message = text || `Erro ${response.status}`;
    try {
      const problem = JSON.parse(text);
      if (problem.detail) message = problem.detail;
      else if (problem.message) message = problem.message;
    } catch {
      // not JSON — keep raw text
    }

    if (response.status === 401 && !isPublicPath(path)) {
      clearToken();
      try {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      } catch {
        // SSR/teste — ignorar
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as unknown as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

export const apiClient = {
  get: async <T>(path: string, params: Record<string, unknown> = {}) => {
    const query = buildQuery(params);
    try {
      console.debug('[apiClient] GET', `${API_BASE_URL}${path}${query}`);
    } catch {}
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'GET',
      headers: buildHeaders(path, {}, false),
      cache: 'no-store',
    });
    return handleResponse<T>(res, path);
  },

  post: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
    extraHeaders: Record<string, string> = {},
  ) => {
    const query = buildQuery(params);
    try {
      console.debug('[apiClient] POST', `${API_BASE_URL}${path}${query}`, body);
    } catch {}
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'POST',
      headers: buildHeaders(path, extraHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res, path);
  },

  patch: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    try {
      console.debug('[apiClient] PATCH', `${API_BASE_URL}${path}${query}`, body);
    } catch {}
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'PATCH',
      headers: buildHeaders(path),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res, path);
  },

  put: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    try {
      console.debug('[apiClient] PUT', `${API_BASE_URL}${path}${query}`, body);
    } catch {}
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'PUT',
      headers: buildHeaders(path),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res, path);
  },

  delete: async <T>(
    path: string,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'DELETE',
      headers: buildHeaders(path, {}, false),
    });
    return handleResponse<T>(res, path);
  },

  postMultipart: async <T>(
    path: string,
    body: FormData,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'POST',
      headers: buildHeaders(path, {}, false),
      body,
    });
    return handleResponse<T>(res, path);
  },
};
