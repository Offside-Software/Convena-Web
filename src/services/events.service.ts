import { apiClient } from './api/client.ts'
import { mockEvents } from '../data/mockData.ts'
import type {
  Event,
  EventFilterParams,
  CreateEventInput,
  CreateEventResponse,
  RawApiEvent,
  RegisterTicketInput,
  RegisterTicketResponse,
  TicketTier,
  EventCategory,
  EventStatus,
} from '../types/event.ts'
import type { EventWithRole } from '../types/membership.ts'

export type EventRawInput = (RawApiEvent | EventWithRole) & {
  ticketTiers?: TicketTier[]
  tags?: string[]
  attendeeCount?: number
  totalCapacity?: number
}

export function normalizeEvent(rawInput: RawApiEvent | EventWithRole): Event {
  const raw = rawInput as EventRawInput

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
          id: `tier-general-${raw.id}`,
          name: 'General Admission',
          price: 0,
          quota: raw.totalCapacity || 500,
          sold: raw.attendeeCount || 0,
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

  const locationType =
    raw.locationType === 'online' || raw.locationType === 'hybrid'
      ? raw.locationType
      : 'offline'

  const address = 'address' in raw ? (raw.address ?? undefined) : undefined
  const city = 'city' in raw ? (raw.city ?? undefined) : undefined
  const onlineUrl = 'onlineUrl' in raw ? (raw.onlineUrl ?? undefined) : undefined

  return {
    id: String(raw.id),
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
    location: {
      type: locationType,
      venueName: raw.venueName || 'Telkom University Convention Hall',
      address,
      city: city || 'Bandung',
      onlineUrl,
    },
    organizationId: raw.createdBy || 'org-default',
    organizationName: raw.organizationName || 'BEM & DPM Kema Telkom University',
    university: raw.university || 'Telkom University',
    ticketTiers,
    tags: raw.tags && raw.tags.length > 0 ? raw.tags : ['Ormawa', 'Kampus', 'Inovasi'],
    attendeeCount: raw.attendeeCount ?? 0,
    totalCapacity: raw.totalCapacity ?? 500,
    myRole: 'myRole' in raw ? raw.myRole : undefined,
    myCustomTitle: 'myCustomTitle' in raw ? raw.myCustomTitle : undefined,
  }
}

export class EventsService {
  async getEvents(params?: EventFilterParams): Promise<Event[]> {
    try {
      const queryParams: Record<string, string | undefined> = {
        category: params?.category,
        university: params?.university,
        status: params?.status,
        search: params?.search,
      }
      const rawEvents = await apiClient.get<RawApiEvent[]>('/events', queryParams)
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
      if (params?.university && params.university !== 'all') {
        filtered = filtered.filter((e) =>
          e.university.toLowerCase().includes(params.university!.toLowerCase())
        )
      }
      if (params?.search) {
        const query = params.search.toLowerCase()
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            (e.tags && e.tags.some((t) => t.toLowerCase().includes(query)))
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
      const raw = await apiClient.get<RawApiEvent>(`/events/${id}`)
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
