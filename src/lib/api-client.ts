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

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else if (typeof value === 'object') {
      // Para objetos simples, serializamos como JSON
      search.append(key, JSON.stringify(value));
    } else {
      search.append(key, String(value));
    }
  });

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let message = text || `Erro ${response.status}`;
    try {
      const problem = JSON.parse(text);
      if (problem.detail) message = problem.detail;
    } catch {
      // not JSON — keep raw text
    }
    throw new Error(message);
  }

  // Sem conteúdo (204) ou corpo vazio
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
    // Alguns endpoints podem retornar 200/201 sem corpo
    return undefined as unknown as T;
  }
}

export const apiClient = {
  get: async <T>(path: string, params: Record<string, unknown> = {}) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'GET',
      cache: 'no-store',
    });
    return handleResponse<T>(res);
  },

  post: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  patch: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  put: async <T>(
    path: string,
    body?: unknown,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(
    path: string,
    params: Record<string, unknown> = {},
  ) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: 'DELETE',
    });
    return handleResponse<T>(res);
  },
};

