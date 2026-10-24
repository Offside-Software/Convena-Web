export type UserRole =
  | 'user'
  | 'admin'
  | 'committee'
  | 'treasurer'
  | 'sponsor'
  | 'attendee'

export type GlobalRole = 'user' | 'system_admin'

export interface User {
  id: string
  name: string
  displayName?: string
  username?: string
  email: string
  role?: string
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
  role?: string
  company?: string
}
