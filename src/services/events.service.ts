import { apiClient } from './api/client.ts'
import { mockEvents } from '../data/mockData.ts'
import type { Event, EventFilterParams } from '../types/event.ts'

export class EventsService {
  async getEvents(params?: EventFilterParams): Promise<Event[]> {
    try {
      const queryParams: Record<string, string | undefined> = {
        category: params?.category,
        university: params?.university,
        status: params?.status,
        search: params?.search,
      }
      return await apiClient.get<Event[]>('/events', queryParams)
    } catch {
      // Graceful fallback to rich mock data
      let filtered = [...mockEvents]
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((e) => e.category === params.category)
      }
      if (params?.university && params.university !== 'all') {
        filtered = filtered.filter((e) => e.university.toLowerCase().includes(params.university!.toLowerCase()))
      }
      if (params?.search) {
        const query = params.search.toLowerCase()
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            e.tags.some((t) => t.toLowerCase().includes(query))
        )
      }
      return filtered
    }
  }

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      return await apiClient.get<Event>(`/events/${id}`)
    } catch {
      return mockEvents.find((e) => e.id === id)
    }
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      return await apiClient.post<Event>('/events', eventData)
    } catch {
      const newEvent: Event = {
        id: `evt-${Date.now()}`,
        title: eventData.title || 'Untitled Event',
        slug: (eventData.title || 'event').toLowerCase().replace(/\s+/g, '-'),
        description: eventData.description || '',
        shortDescription: eventData.shortDescription || '',
        bannerUrl: eventData.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        category: eventData.category || 'seminar',
        status: 'published',
        visibility: 'public',
        startDate: eventData.startDate || new Date().toISOString(),
        endDate: eventData.endDate || new Date().toISOString(),
        location: eventData.location || { type: 'offline', venueName: 'Kampus', city: 'Jakarta' },
        organizationId: 'org-hmif-itb',
        organizationName: 'HMIF ITB',
        university: 'Institut Teknologi Bandung',
        ticketTiers: eventData.ticketTiers || [],
        tags: eventData.tags || ['StudentEvent'],
        attendeeCount: 0,
        totalCapacity: 200,
        certificateAvailable: true,
      }
      mockEvents.unshift(newEvent)
      return newEvent
    }
  }

  async registerTicket(eventId: string, ticketTierId: string, attendee: { name: string; email: string; studentId?: string }): Promise<{ registrationId: string; qrCode: string; status: string }> {
    try {
      return await apiClient.post(`/events/${eventId}/register`, { ticketTierId, ...attendee })
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
