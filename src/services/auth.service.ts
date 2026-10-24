import { apiClient } from './api/client.ts'
import { mockCurrentUser } from '../data/mockData.ts'
import type { User, UserRole } from '../types/user.ts'

export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

const AUTH_TOKEN_KEY = 'convena_auth_token'
const AUTH_USER_KEY = 'convena_auth_user'

export class AuthService {
  async login(payload: LoginPayload): Promise<User> {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', payload)
      this.saveSession(response.token, response.user)
      return response.user
    } catch {
      // Fallback ke data mock jika backend belum menyala
      const user: User = {
        ...mockCurrentUser,
        name: payload.email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: payload.email,
        role: payload.role,
      }
      this.saveSession(`mock_token_${Date.now()}`, user)
      return user
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiClient.get<User>('/auth/me')
    } catch {
      return this.getStoredUser() || mockCurrentUser
    }
  }

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('convena-auth-changed'))
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    window.dispatchEvent(new Event('convena-auth-changed'))
  }
}

export const authService = new AuthService()
