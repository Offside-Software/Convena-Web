import type { TicketTier } from './event.ts'

export type EventRole =
  | 'owner'
  | 'admin'
  | 'committee'
  | 'treasurer'
  | 'sponsor'
  | 'attendee'

export interface EventMember {
  id: string
  eventId: string
  userId: string
  displayName: string
  username: string
  email: string
  role: EventRole
  customTitle?: string
  status: 'active' | 'suspended'
  joinedAt: string
}

export interface EventWithRole {
  id: string
  createdBy: string
  title: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  bannerUrl?: string | null
  category: string
  status: string
  visibility: string
  startDate: string
  endDate: string
  locationType: string
  venueName?: string | null
  address?: string | null
  city?: string | null
  onlineUrl?: string | null
  organizationName?: string | null
  company?: string | null
  ticketTiers?: TicketTier[]
  createdAt: string
  updatedAt?: string | null
  myRole: EventRole
  myCustomTitle?: string | null
}

export interface InviteMemberPayload {
  email: string
  role: EventRole
  customTitle?: string
}

export interface UpdateMemberRolePayload {
  role: EventRole
  customTitle?: string
}
