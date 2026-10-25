import { apiClient } from './api/client.ts'
import type { User, AuthResponse, LoginCredentials, RegisterPayload } from '../types/user.ts'

const TOKEN_KEY = 'convena_auth_token'

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) {
      return null
    }

    try {
      return await apiClient.get<User>('/auth/me')
    } catch {
      this.logout()
      return null
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token)
    }
    return response
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload)
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token)
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
  }
}

export const authService = new AuthService()
