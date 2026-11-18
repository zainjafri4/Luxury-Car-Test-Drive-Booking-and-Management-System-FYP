export class ApiError extends Error {
  code?: string | undefined;
  status: number;
  details?: unknown;

  constructor(message: string, status: number, code?: string | undefined, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('zr_access_token', token);
    } else {
      localStorage.removeItem('zr_access_token');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('zr_access_token');
  }
  return accessToken;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const url = new URL(`${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers(options.headers);
  headers.set('X-Requested-With', 'XMLHttpRequest'); // CSRF check pass
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers,
    credentials: 'include', // Needed for refresh_token cookie
  });

  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const errorCode = data?.error?.code || data?.code;
    const errorDetails = data?.error?.details || data?.details;
    throw new ApiError(errorMsg, res.status, errorCode, errorDetails);
  }

  return data;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
