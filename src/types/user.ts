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
  email: string
  role: UserRole
  organizationId?: string
  avatarUrl?: string
  university?: string
  studentId?: string
}
