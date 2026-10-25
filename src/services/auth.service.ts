import { mockCurrentUser } from '../data/mockData.ts'
import type { User, AuthResponse, LoginCredentials, RegisterPayload } from '../types/user.ts'

const TOKEN_KEY = 'convena_auth_token'
const DUMMY_TOKEN = 'dummy-convena-auth-token-lecturer-test'

export class AuthService {
  private activeUser: User = { ...mockCurrentUser }

  async getCurrentUser(): Promise<User | null> {
    // Offline/No-API dummy mode: always authenticated
    return Promise.resolve(this.activeUser)
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      localStorage.setItem(TOKEN_KEY, DUMMY_TOKEN)
    } catch {
      // ignore
    }

    if (credentials.identifier && credentials.identifier.includes('@')) {
      this.activeUser.email = credentials.identifier
    }

    return Promise.resolve({
      token: DUMMY_TOKEN,
      user: this.activeUser,
    })
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      localStorage.setItem(TOKEN_KEY, DUMMY_TOKEN)
    } catch {
      // ignore
    }

    this.activeUser = {
      ...this.activeUser,
      name: payload.name || this.activeUser.name,
      displayName: payload.name || this.activeUser.displayName,
      username: payload.username || this.activeUser.username,
      email: payload.email || this.activeUser.email,
      company: payload.company || this.activeUser.company,
    }

    return Promise.resolve({
      token: DUMMY_TOKEN,
      user: this.activeUser,
    })
  }

  getToken(): string | null {
    return DUMMY_TOKEN
  }

  isAuthenticated(): boolean {
    return true
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // ignore
    }
    // Retain default dummy user for offline test resilience
    this.activeUser = { ...mockCurrentUser }
  }
}

export const authService = new AuthService()
