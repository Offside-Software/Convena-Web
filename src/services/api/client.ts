import type { ApiError } from '../../types/api.ts'

export const DEFAULT_PRODUCTION_API_URL = "https://env-opentask.user.cloudjkt02.com/api/convena";
export const DEFAULT_DEV_API_URL = 'http://localhost:8000';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export function getBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return import.meta.env.DEV ? DEFAULT_DEV_API_URL : DEFAULT_PRODUCTION_API_URL;
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('convena_auth_token')
    } catch {
      return null
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const fullUrl = path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${this.baseUrl.replace(/\/+$/, '')}${cleanPath}`

    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    const url = new URL(fullUrl, baseOrigin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...rest } = options
    const url = this.buildUrl(path, params)

    const token = this.getAuthToken()
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        ...rest,
      })

      if (!response.ok) {
        let errorData: ApiError
        try {
          errorData = await response.json()
        } catch {
          errorData = {
            message: response.statusText || 'Network request failed',
            code: String(response.status),
          }
        }
        throw errorData
      }

      return (await response.json()) as T
    } catch (err: unknown) {
      let error: ApiError
      if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        const msg = (err as any).message
        const isNetworkFailure =
          msg.toLowerCase().includes('fetch') ||
          msg.toLowerCase().includes('network') ||
          msg.toLowerCase().includes('connect')
        error = {
          message: isNetworkFailure
            ? 'Tidak dapat terhubung ke server API. Pastikan server aktif.'
            : (err as any).message,
          code: (err as any).code || (isNetworkFailure ? 'CONNECTION_REFUSED' : 'REQUEST_FAILED'),
          details: (err as any).details,
        }
      } else {
        error = {
          message: 'Terjadi kesalahan jaringan atau server API tidak dapat dijangkau.',
          code: 'CONNECTION_REFUSED',
        }
      }
      console.warn(`[ApiClient] Request failed for ${path}:`, error)
      throw error
    }
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params })
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(getBaseUrl())
