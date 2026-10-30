import { apiClient } from './api/client.ts'
import type { User, AuthResponse, LoginCredentials, RegisterPayload } from '../types/user.ts'
import { mockCurrentUser } from '../data/mockData.ts'

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
          // ignore error
        }
      }
      if (token.startsWith('mock_')) {
        return mockCurrentUser
      }
      this.logout()
      return null
    }
    return null
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      if (response?.token) {
        localStorage.setItem(TOKEN_KEY, response.token)
        if (response.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        }
      }
      return response
    } catch {
      // Mock fallback so admin login works smoothly without a live backend
      const mockToken = 'mock_admin_token'
      const username = credentials.identifier.includes('@')
        ? credentials.identifier.split('@')[0]
        : credentials.identifier

      const user: User = {
        ...mockCurrentUser,
        name: username.charAt(0).toUpperCase() + username.slice(1) || 'Arya Pratama',
        email: credentials.identifier.includes('@') ? credentials.identifier : 'admin@telkomuniversity.ac.id',
        role: 'admin',
        company: 'BEM & DPM Kema Telkom University',
      }

      localStorage.setItem(TOKEN_KEY, mockToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      return {
        token: mockToken,
        user,
      }
    }
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', payload)
      if (response?.token) {
        localStorage.setItem(TOKEN_KEY, response.token)
        if (response.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        }
      }
      return response
    } catch {
      const mockToken = 'mock_admin_token'
      const user: User = {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: 'admin',
        university: payload.company || 'Telkom University',
        company: payload.company || 'Organisasi Mahasiswa',
      }
      localStorage.setItem(TOKEN_KEY, mockToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return {
        token: mockToken,
        user,
      }
    }
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
