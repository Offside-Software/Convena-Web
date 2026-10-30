import { apiClient } from './api/client.ts'
import { mockEvents } from '../data/mockData.ts'
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
} from '../types/event.ts'
import type { EventWithRole } from '../types/membership.ts'

export function normalizeEvent(raw: any): Event {
  // Ensure ticketTiers is always an array
  let ticketTiers: TicketTier[] = []
  if (Array.isArray(raw.ticketTiers) && raw.ticketTiers.length > 0) {
    ticketTiers = raw.ticketTiers
  } else {
    // Check if mockEvents has predefined tiers for this event
    const matchedMock = mockEvents.find((m) => m.id === String(raw.id) || m.slug === raw.slug)
    if (matchedMock?.ticketTiers && matchedMock.ticketTiers.length > 0) {
      ticketTiers = matchedMock.ticketTiers
    } else {
      ticketTiers = [
        {
          id: `tier-std-${raw.id || 'default'}`,
          name: 'Standard',
          price: 0,
          quota: 250,
          sold: 0,
          benefits: ['Akses Acara Penuh', 'Sertifikat Digital', 'Materi Pembicara'],
          isAvailable: true,
        },
      ]
    }
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

  const venueName = raw.venueName || raw.location?.venueName || (locationType === 'online' ? 'Online' : 'Venue Acara')
  const address = raw.address || raw.location?.address || ''
  const city = raw.city || raw.location?.city || ''
  const onlineUrl = raw.onlineUrl || raw.location?.onlineUrl || ''
  const company = raw.company || raw.university || 'Telkom University'
  const organizationName = raw.organizationName || 'BEM & DPM Kema Telkom University'

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
    title: raw.title || 'Untitled Event',
    slug: raw.slug || String(raw.id),
    description: raw.description || '',
    shortDescription: raw.shortDescription || (raw.description ? raw.description.slice(0, 120) : ''),
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
    },
    attendeeCount,
    totalCapacity,
    myRole: raw.myRole,
    myCustomTitle: raw.myCustomTitle,
  }
}

export class EventsService {
  async getEvents(params?: EventFilterParams): Promise<Event[]> {
    try {
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
    } catch {
      // Graceful fallback to rich mock data
      let filtered = [...mockEvents]
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((e) => e.category === params.category)
      }
      if (params?.company && params.company !== 'all') {
        filtered = filtered.filter((e) =>
          e.company?.toLowerCase().includes(params.company!.toLowerCase())
        )
      }
      if (params?.search) {
        const query = params.search.toLowerCase()
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            (e.description && e.description.toLowerCase().includes(query)) ||
            (e.organizationName && e.organizationName.toLowerCase().includes(query)) ||
            (e.company && e.company.toLowerCase().includes(query))
        )
      }
      return filtered
    }
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
    return mockEvents.find((e) => e.id === id)
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

  async registerTicket(
    eventId: string,
    ticketTierId: string,
    attendee: RegisterTicketInput
  ): Promise<RegisterTicketResponse> {
    try {
      return await apiClient.post<RegisterTicketResponse>(`/events/${eventId}/register`, {
        ticketTierId,
        ...attendee,
      })
    } catch {
      return {
        registrationId: `REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        qrCode: `CONVENA-TKT-${eventId}-${ticketTierId}`,
        status: 'confirmed',
      }
    }
  }
}

export const eventsService = new EventsService()
