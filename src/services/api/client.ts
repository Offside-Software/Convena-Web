import type { ApiError } from '../../types/api.ts'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
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
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`)
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
      const error = err as ApiError
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

export const apiClient = new ApiClient(BASE_URL)
