export type UserRole =
  | 'admin'
  | 'committee'
  | 'treasurer'
  | 'sponsor'
  | 'attendee'
  | 'verifier'

export interface User {
  id: string
  name: string
  displayName?: string
  username?: string
  email: string
  role: UserRole
  company?: string
  organizationId?: string
  avatarUrl?: string
  university?: string
  studentId?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  identifier: string // email or username
  password: string
}

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  role?: UserRole
  company?: string
}

