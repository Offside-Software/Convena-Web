import { apiClient } from './api/client.ts'
import { mockCurrentUser } from '../data/mockData.ts'
import type { User } from '../types/user.ts'

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiClient.get<User>('/auth/me')
    } catch {
      return mockCurrentUser
    }
  }

  logout(): void {
    localStorage.removeItem('convena_auth_token')
  }
}

export const authService = new AuthService()
