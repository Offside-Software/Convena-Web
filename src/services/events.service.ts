import { mockEvents } from '../data/mockData.ts'
import type { Event, EventFilterParams, CreateEventInput } from '../types/event.ts'

export class EventsService {
  async getEvents(params?: EventFilterParams): Promise<Event[]> {
    let filtered = [...mockEvents]

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter((e) => e.category === params.category)
    }

    if (params?.university && params.university !== 'all') {
      const uniQuery = params.university.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.university.toLowerCase().includes(uniQuery) ||
          e.organizationName.toLowerCase().includes(uniQuery)
      )
    }

    if (params?.search) {
      const query = params.search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.shortDescription.toLowerCase().includes(query) ||
          e.tags.some((t) => t.toLowerCase().includes(query)) ||
          e.university.toLowerCase().includes(query)
      )
    }

    return Promise.resolve(filtered)
  }

  async getMyEvents(): Promise<Event[]> {
    // Return all events managed by the current organizer / committee
    const myEvents = mockEvents.filter((e) => Boolean(e.myRole))
    return Promise.resolve(myEvents.length > 0 ? myEvents : mockEvents.slice(0, 3))
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const found = mockEvents.find((e) => e.id === id || e.slug === id)
    return Promise.resolve(found)
  }

  async createEvent(eventData: CreateEventInput): Promise<Event> {
    const eventId = `evt-${Date.now().toString(36)}`
    const slug = eventData.slug || eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const newEvent: Event = {
      id: eventId,
      title: eventData.title,
      slug,
      description: eventData.description || 'Deskripsi acara belum diisi.',
      shortDescription: eventData.shortDescription || eventData.description?.slice(0, 120) || 'Acara mahasiswa resmi terintegrasi Convena.',
      bannerUrl: eventData.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      category: eventData.category,
      status: 'published',
      visibility: 'public',
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      location: {
        type: eventData.locationType || 'offline',
        venueName: eventData.venueName || 'Kampus Utama',
        address: eventData.address || 'Gedung Serba Guna',
        city: eventData.city || 'Bandung',
        onlineUrl: eventData.onlineUrl,
      },
      organizationId: 'org-hmif-itb',
      organizationName: eventData.organizationName || 'HMIF ITB',
      university: eventData.university || 'Institut Teknologi Bandung',
      tags: ['Ormawa', eventData.category, 'Convena2026'],
      attendeeCount: 0,
      totalCapacity: 500,
      certificateAvailable: true,
      myRole: 'owner',
      myCustomTitle: 'Ketua Pelaksana',
      ticketTiers: [
        {
          id: `tkt-${Date.now().toString().slice(-4)}-reg`,
          name: 'General Admission / Presale Pass',
          price: 25000,
          quota: 250,
          sold: 0,
          benefits: ['Akses seluruh sesi acara', 'E-Sertifikat resmi terverifikasi ID', 'Snack & Coffee Break kit'],
          isAvailable: true,
        },
        {
          id: `tkt-${Date.now().toString().slice(-4)}-vip`,
          name: 'VIP Delegate & Workshop Access',
          price: 50000,
          quota: 50,
          sold: 0,
          benefits: ['Priority Front Row Seating', 'Networking session dengan pemateri', 'Exclusive Merchandise pack'],
          isAvailable: true,
        },
      ],
    }

    mockEvents.unshift(newEvent)
    return Promise.resolve(newEvent)
  }

  async registerTicket(
    eventId: string,
    ticketTierId: string,
    _attendee: { name: string; email: string; studentId?: string }
  ): Promise<{ registrationId: string; qrCode: string; status: string }> {
    const evt = mockEvents.find((e) => e.id === eventId)
    if (evt) {
      evt.attendeeCount += 1
      const tier = evt.ticketTiers.find((t) => t.id === ticketTierId)
      if (tier) {
        tier.sold += 1
      }
    }

    const regId = `REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    return Promise.resolve({
      registrationId: regId,
      qrCode: `CONVENA-TKT-${eventId}-${ticketTierId}-${regId}`,
      status: 'confirmed',
    })
  }
}

export const eventsService = new EventsService()
