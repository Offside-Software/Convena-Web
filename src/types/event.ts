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
  latitude?: number | null
  longitude?: number | null
}

export interface Event {
  id: string
  createdBy?: string
  organizationId?: string | null
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
  latitude?: number | null
  longitude?: number | null
  attendanceQrToken?: string | null
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
  myRole?: string
  myCustomTitle?: string
  myDivision?: string
}

export interface CreateEventInput {
  title: string
  slug?: string
  organizationId?: string | null
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
  latitude?: number | null
  longitude?: number | null
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

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  tierId: string
  tierName: string
  price: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid'
  status: 'pending_payment' | 'confirmed' | 'checked_in' | 'cancelled'
  attendeeName: string
  attendeeEmail: string
  attendeePhone?: string | null
  attendeeInstitution?: string | null
  ticketCode: string
  checkedInAt?: string | null
  createdAt: string
}

export interface RegisterTicketInput {
  name: string
  email: string
  studentId?: string
  tierId?: string
  paymentMethod?: string
  phone?: string
  institution?: string
}

export interface RegisterTicketResponse {
  registrationId: string
  qrCode: string
  status: string
  registration?: EventRegistration
  message?: string
}

export interface AttendanceQrResponse {
  eventId: string
  eventTitle: string
  qrToken: string
  qrPayload: string
  message: string
}

export interface AttendEventResponse {
  message: string
  alreadyCheckedIn: boolean
  eventTitle: string
  registration: EventRegistration
}

export interface AttendanceRealtimeEvent {
  eventType: 'attendance.checked_in' | 'registration.created' | string
  eventId: string
  eventTitle: string
  alreadyCheckedIn: boolean
  message: string
  registration: EventRegistration
  timestamp: string
}
