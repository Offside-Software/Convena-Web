export type EventCategory =
  | 'seminar'
  | 'workshop'
  | 'competition'
  | 'festival'
  | 'conference'
  | 'gathering'

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

export type EventVisibility = 'public' | 'private'

export type LocationType = 'offline' | 'online' | 'hybrid'

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
  type: LocationType
  venueName?: string
  address?: string
  city?: string
  onlineUrl?: string
}

export interface Event {
  id: string
  createdBy?: string
  title: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  bannerUrl?: string | null
  category: EventCategory
  status: EventStatus
  visibility?: EventVisibility
  startDate: string
  endDate: string
  locationType?: LocationType
  venueName?: string | null
  address?: string | null
  city?: string | null
  onlineUrl?: string | null
  organizationName?: string | null
  company?: string | null
  ticketTiers?: TicketTier[]
  createdAt?: string
  updatedAt?: string

  // UI convenience mappings
  location: EventLocation
  attendeeCount: number
  totalCapacity: number
  tags?: string[]
  organizationId?: string
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
  status?: EventStatus
  visibility?: EventVisibility
  startDate: string
  endDate: string
  locationType: LocationType
  venueName?: string
  address?: string
  city?: string
  onlineUrl?: string
  organizationName?: string
  company?: string
  ticketTiers?: TicketTier[]
}

export interface CreateEventResponse {
  event: Event
  role: string
}

export interface EventFilterParams {
  category?: string
  company?: string
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
