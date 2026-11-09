import { apiClient } from './api/client.ts'
import type {
  Event,
  EventFilterParams,
  CreateEventInput,
  CreateEventResponse,
  RegisterTicketInput,
  RegisterTicketResponse,
  TicketTier,
  EventCategory,
  EventStatus,
  LocationType,
  EventRegistration,
  AttendanceQrResponse,
  AttendEventResponse,
} from '../types/event.ts'
import type {
  EventMember,
  EventWithRole,
  InviteMemberPayload,
  UpdateMemberRolePayload,
} from '../types/membership.ts'

export function normalizeEvent(raw: any): Event {
  let ticketTiers: TicketTier[] = []
  if (Array.isArray(raw.ticketTiers) && raw.ticketTiers.length > 0) {
    ticketTiers = raw.ticketTiers
  }

  const validCategories: EventCategory[] = [
    'seminar',
    'workshop',
    'competition',
    'festival',
    'conference',
    'gathering',
  ]
  const category = validCategories.includes(raw.category as EventCategory)
    ? (raw.category as EventCategory)
    : 'seminar'

  const validStatuses: EventStatus[] = ['draft', 'published', 'ongoing', 'completed', 'cancelled']
  const status = validStatuses.includes(raw.status as EventStatus)
    ? (raw.status as EventStatus)
    : 'published'

  const locationType: LocationType =
    raw.locationType === 'online' || raw.locationType === 'hybrid'
      ? raw.locationType
      : 'offline'

  const venueName =
    raw.venueName || raw.location?.venueName || (locationType === 'online' ? 'Online' : 'Venue Acara')
  const address = raw.address || raw.location?.address || ''
  const city = raw.city || raw.location?.city || ''
  const onlineUrl = raw.onlineUrl || raw.location?.onlineUrl || ''
  const latitude =
    typeof raw.latitude === 'number'
      ? raw.latitude
      : typeof raw.location?.latitude === 'number'
        ? raw.location.latitude
        : null
  const longitude =
    typeof raw.longitude === 'number'
      ? raw.longitude
      : typeof raw.location?.longitude === 'number'
        ? raw.location.longitude
        : null
  const company = raw.company || raw.university || 'Institut Teknologi Bandung'
  const organizationName = raw.organizationName || 'HMIF ITB'

  const attendeeCount =
    typeof raw.attendeeCount === 'number'
      ? raw.attendeeCount
      : ticketTiers.reduce((acc, t) => acc + (t.sold || 0), 0)

  const totalCapacity =
    typeof raw.totalCapacity === 'number' && raw.totalCapacity > 0
      ? raw.totalCapacity
      : ticketTiers.reduce((acc, t) => acc + (t.quota || 0), 0) || 500

  return {
    id: String(raw.id),
    createdBy: raw.createdBy || 'usr-default',
    organizationId: raw.organizationId || null,
    title: raw.title || 'Untitled Event',
    slug: raw.slug || String(raw.id),
    description: raw.description || '',
    shortDescription:
      raw.shortDescription || (raw.description ? raw.description.slice(0, 120) : ''),
    bannerUrl:
      raw.bannerUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    category,
    status,
    visibility: raw.visibility === 'private' ? 'private' : 'public',
    startDate: raw.startDate,
    endDate: raw.endDate || raw.startDate,
    locationType,
    venueName,
    address,
    city,
    onlineUrl,
    latitude,
    longitude,
    attendanceQrToken: raw.attendanceQrToken || null,
    organizationName,
    company,
    ticketTiers,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
    location: {
      type: locationType,
      venueName,
      address,
      city,
      onlineUrl,
      latitude,
      longitude,
    },
    attendeeCount,
    totalCapacity,
    myRole: raw.myRole,
    myCustomTitle: raw.myCustomTitle,
    myDivision: raw.myDivision,
  }
}

export class EventsService {
  async getEvents(params?: EventFilterParams): Promise<Event[]> {
    const queryParams: Record<string, string | undefined> = {
      category: params?.category,
      company: params?.company,
      status: params?.status,
      search: params?.search,
    }
    const rawEvents = await apiClient.get<any[]>('/events', queryParams)
    if (Array.isArray(rawEvents)) {
      return rawEvents.map(normalizeEvent)
    }
    return []
  }

  async getMyEvents(): Promise<Event[]> {
    try {
      const res = await apiClient.get<EventWithRole[]>('/events/my-events')
      if (Array.isArray(res)) {
        return res.map(normalizeEvent)
      }
      return []
    } catch {
      return []
    }
  }

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      const raw = await apiClient.get<any>(`/events/${id}`)
      if (raw) {
        return normalizeEvent(raw)
      }
    } catch {
      // Fallback
    }
    return undefined
  }

  async createEvent(eventData: CreateEventInput): Promise<Event> {
    const res = await apiClient.post<CreateEventResponse>('/events', eventData)
    const normalized = normalizeEvent(res.event)
    return {
      ...normalized,
      myRole: res.role || 'owner',
      myCustomTitle: 'Event Creator',
    }
  }

  async updateEvent(id: string, eventData: Partial<CreateEventInput>): Promise<Event> {
    const res = await apiClient.patch<{ event: any }>(`/events/${id}`, eventData)
    return normalizeEvent(res.event || res)
  }

  async getEventMembers(eventId: string): Promise<EventMember[]> {
    try {
      const res = await apiClient.get<EventMember[]>(`/events/${eventId}/members`)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  }

  async addEventMember(
    eventId: string,
    payload: InviteMemberPayload
  ): Promise<{ message: string; status: string }> {
    return await apiClient.post(`/events/${eventId}/members`, payload)
  }

  async updateEventMember(
    eventId: string,
    userId: string,
    payload: UpdateMemberRolePayload
  ): Promise<{ message: string }> {
    return await apiClient.patch(`/events/${eventId}/members/${userId}`, payload)
  }

  async removeEventMember(eventId: string, userId: string): Promise<{ message: string }> {
    return await apiClient.delete(`/events/${eventId}/members/${userId}`)
  }

  async registerForEvent(
    eventId: string,
    payload: {
      tierId: string
      paymentMethod?: string
      attendeeName?: string
      attendeeEmail?: string
      attendeePhone?: string
      attendeeInstitution?: string
    }
  ): Promise<{ message: string; registration: EventRegistration }> {
    return await apiClient.post(`/events/${eventId}/register`, payload)
  }

  async getMyRegistration(eventId: string): Promise<EventRegistration | null> {
    try {
      const res = await apiClient.get<{ registration: EventRegistration | null }>(
        `/events/${eventId}/my-registration`
      )
      return res?.registration ?? null
    } catch {
      return null
    }
  }

  async getMyRegistrations(): Promise<EventRegistration[]> {
    try {
      const res = await apiClient.get<EventRegistration[]>('/events/my-registrations')
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const res = await apiClient.get<EventRegistration[]>(`/events/${eventId}/registrations`)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  }

  async generateAttendanceQr(eventId: string): Promise<AttendanceQrResponse> {
    return await apiClient.post<AttendanceQrResponse>(`/events/${eventId}/attendance-qr`, {})
  }

  async attendEventByQr(qrCode: string, eventId?: string): Promise<AttendEventResponse> {
    return await apiClient.post<AttendEventResponse>('/events/attend', {
      qrCode,
      eventId,
    })
  }

  async registerTicket(
    eventId: string,
    ticketTierId: string,
    attendee: RegisterTicketInput
  ): Promise<RegisterTicketResponse> {
    const res = await this.registerForEvent(eventId, {
      tierId: ticketTierId,
      paymentMethod: attendee.paymentMethod,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone,
      attendeeInstitution: attendee.institution,
    })
    return {
      registrationId: res.registration.id,
      qrCode: res.registration.ticketCode,
      status: res.registration.status,
      registration: res.registration,
      message: res.message,
    }
  }
}

export const eventsService = new EventsService()
