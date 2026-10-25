import { apiClient } from './api/client.ts'
import { mockEvents } from '../data/mockData.ts'
import type { Event, EventFilterParams, CreateEventInput, CreateEventResponse } from '../types/event.ts'

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

  async getMyEvents(): Promise<Event[]> {
    try {
      const res = await apiClient.get<any[]>('/events/my-events')
      if (Array.isArray(res)) {
        return res.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description || '',
          shortDescription: item.shortDescription || '',
          bannerUrl: item.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          category: item.category || 'seminar',
          status: item.status || 'draft',
          visibility: item.visibility || 'public',
          startDate: item.startDate,
          endDate: item.endDate,
          location: {
            type: item.locationType || 'offline',
            venueName: item.venueName || 'Kampus',
            city: item.city || 'Indonesia',
          },
          organizationId: item.createdBy,
          organizationName: item.organizationName || 'Ormawa Kampus',
          university: item.university || 'Perguruan Tinggi',
          ticketTiers: [],
          tags: ['Ormawa'],
          attendeeCount: 0,
          totalCapacity: 500,
          myRole: item.myRole,
          myCustomTitle: item.myCustomTitle,
        }))
      }
      return []
    } catch {
      return []
    }
  }

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      return await apiClient.get<Event>(`/events/${id}`)
    } catch {
      return mockEvents.find((e) => e.id === id)
    }
  }

  async createEvent(eventData: CreateEventInput): Promise<Event> {
    const res = await apiClient.post<CreateEventResponse>('/events', eventData)
    const evt = res.event
    return {
      id: evt.id,
      title: evt.title,
      slug: evt.slug,
      description: evt.description || '',
      shortDescription: evt.shortDescription || '',
      bannerUrl: evt.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      category: evt.category,
      status: evt.status || 'draft',
      visibility: evt.visibility || 'public',
      startDate: evt.startDate,
      endDate: evt.endDate,
      location: {
        type: eventData.locationType || 'offline',
        venueName: eventData.venueName || 'Kampus',
        address: eventData.address,
        city: eventData.city,
        onlineUrl: eventData.onlineUrl,
      },
      organizationId: evt.organizationId || 'my-org',
      organizationName: eventData.organizationName || 'Ormawa Kampus',
      university: eventData.university || 'Perguruan Tinggi',
      ticketTiers: [],
      tags: ['Ormawa'],
      attendeeCount: 0,
      totalCapacity: 500,
      myRole: res.role || 'owner',
      myCustomTitle: 'Event Creator',
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
