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
  description?: string
  shortDescription?: string
  bannerUrl?: string
  category: string
  status: string
  visibility: string
  startDate: string
  endDate: string
  locationType: string
  venueName?: string
  organizationName?: string
  university?: string
  createdAt: string
  myRole: EventRole
  myCustomTitle?: string
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
