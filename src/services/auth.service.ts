import { apiClient } from './api/client.ts'
import type { User, AuthResponse, LoginCredentials, RegisterPayload } from '../types/user.ts'

const TOKEN_KEY = 'convena_auth_token'
const USER_KEY = 'convena_current_user'

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) {
      return null
    }

    try {
      const user = await apiClient.get<User>('/auth/me')
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        return user
      }
    } catch {
      const cached = localStorage.getItem(USER_KEY)
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {
          // ignore parse error
        }
      }
      this.logout()
      return null
    }
    return null
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token)
      if (response.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      }
    }
    return response
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload)
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token)
      if (response.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      }
    }
    return response
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export const authService = new AuthService()
