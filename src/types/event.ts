export type EventCategory =
  | 'seminar'
  | 'workshop'
  | 'competition'
  | 'festival'
  | 'conference'
  | 'gathering'

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

export interface TicketTier {
  id: string
  name: string
  price: number
  quota: number
  sold: number
  benefits: string[]
  isAvailable: boolean
}

export interface EventLocation {
  type: 'offline' | 'online' | 'hybrid'
  venueName?: string
  address?: string
  city?: string
  lat?: number
  lng?: number
  onlineUrl?: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  bannerUrl: string
  category: EventCategory
  status: EventStatus
  visibility: 'public' | 'private'
  startDate: string
  endDate: string
  location: EventLocation
  organizationId: string
  organizationName: string
  university: string
  ticketTiers?: TicketTier[]
  tags: string[]
  attendeeCount: number
  totalCapacity: number
  requiresApproval?: boolean
  certificateAvailable?: boolean
  myRole?: string
  myCustomTitle?: string
}

export interface RawApiEvent {
  id: string
  createdBy?: string
  title: string
  slug?: string
  description?: string | null
  shortDescription?: string | null
  bannerUrl?: string | null
  category: string
  status?: string
  visibility?: string
  startDate: string
  endDate?: string
  locationType?: 'offline' | 'online' | 'hybrid' | string
  venueName?: string | null
  address?: string | null
  city?: string | null
  onlineUrl?: string | null
  organizationName?: string | null
  university?: string | null
  createdAt?: string
  updatedAt?: string
  ticketTiers?: TicketTier[]
  tags?: string[]
  attendeeCount?: number
  totalCapacity?: number
  myRole?: string
  myCustomTitle?: string
}

export interface CreateEventInput {
  title: string
  slug?: string
  description?: string
  shortDescription?: string
  bannerUrl?: string
  category: EventCategory
  startDate: string
  endDate: string
  locationType?: 'offline' | 'online' | 'hybrid'
  venueName?: string
  address?: string
  city?: string
  onlineUrl?: string
  organizationName?: string
  university?: string
}

export interface CreateEventResponse {
  event: RawApiEvent
  role: string
}

export interface EventFilterParams {
  category?: string
  university?: string
  city?: string
  status?: string
  search?: string
  priceType?: 'all' | 'free' | 'paid'
}

export interface RegisterTicketInput {
  name: string
  email: string
  studentId?: string
}

export interface RegisterTicketResponse {
  registrationId: string
  qrCode: string
  status: string
}
