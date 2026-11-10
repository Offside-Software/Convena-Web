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
  AttendanceRealtimeEvent,
} from '../types/event.ts'
import type {
  EventMember,
  EventWithRole,
  InviteMemberPayload,
  UpdateMemberRolePayload,
} from '../types/membership.ts'

const CAMPUS_ALIASES: Record<string, string[]> = {
  telkom: ['telkom', 'telkom university', 'tel-u'],
  itb: ['itb', 'institut teknologi bandung'],
  ui: ['ui', 'universitas indonesia'],
  ugm: ['ugm', 'universitas gadjah mada'],
  its: ['its', 'institut teknologi sepuluh nopember'],
  unpad: ['unpad', 'universitas padjadjaran'],
}

function matchesCampusFilter(event: Event, selectedCampus: string): boolean {
  const key = selectedCampus.trim().toLowerCase()
  if (!key || key === 'all') return true

  const aliases = CAMPUS_ALIASES[key] || [key]
  const targetText = `${event.company || ''} ${event.organizationName || ''}`.toLowerCase()

  return aliases.some((alias) => {
    if (alias.length <= 4) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i')
      return regex.test(targetText)
    }
    return targetText.includes(alias)
  })
}

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
  const category = validCategories.includes(raw.category?.toLowerCase() as EventCategory)
    ? (raw.category.toLowerCase() as EventCategory)
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
    const rawEvents = await apiClient.get<any[]>('/events')
    if (!Array.isArray(rawEvents)) {
      return []
    }

    let events = rawEvents.map(normalizeEvent)
    if (params?.category && params.category !== 'all') {
      const targetCategory = params.category.trim().toLowerCase()
      events = events.filter((e) => e.category.toLowerCase() === targetCategory)
    }
    if (params?.company && params.company !== 'all') {
      events = events.filter((e) => matchesCampusFilter(e, params.company!))
    }
    if (params?.status && (params.status as string) !== 'all') {
      const targetStatus = params.status.trim().toLowerCase()
      events = events.filter((e) => e.status.toLowerCase() === targetStatus)
    }
    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim().toLowerCase()
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.organizationName || '').toLowerCase().includes(q) ||
          (e.company || '').toLowerCase().includes(q) ||
          (e.venueName || '').toLowerCase().includes(q) ||
          (e.city || '').toLowerCase().includes(q)
      )
    }

    return events
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
    const res = await apiClient.post<{ message: string; registration: EventRegistration }>(
      `/events/${eventId}/register`,
      payload
    )
    if (res?.registration) {
      this.emitAttendanceEvent({
        eventType: 'registration.created',
        eventId: res.registration.eventId || eventId,
        eventTitle: 'Event Convena',
        alreadyCheckedIn: false,
        message: res.message || `Peserta baru terdaftar: ${res.registration.attendeeName}`,
        registration: res.registration,
        timestamp: new Date().toISOString(),
      })
    }
    return res
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
    const res = await apiClient.post<AttendEventResponse>('/events/attend', {
      qrCode,
      eventId,
    })
    if (res?.registration) {
      this.emitAttendanceEvent({
        eventType: 'attendance.checked_in',
        eventId: res.registration.eventId || eventId || '',
        eventTitle: res.eventTitle || 'Event Convena',
        alreadyCheckedIn: Boolean(res.alreadyCheckedIn),
        message:
          res.message ||
          `${res.registration.attendeeName} (${res.registration.ticketCode}) berhasil melakukan presensi kehadiran!`,
        registration: res.registration,
        timestamp: new Date().toISOString(),
      })
    }
    return res
  }

  async checkInRegistration(
    eventId: string,
    registrationId: string
  ): Promise<AttendEventResponse> {
    const res = await apiClient.post<AttendEventResponse>(
      `/events/${eventId}/registrations/${registrationId}/check-in`,
      {}
    )
    if (res?.registration) {
      this.emitAttendanceEvent({
        eventType: 'attendance.checked_in',
        eventId: res.registration.eventId || eventId,
        eventTitle: res.eventTitle || 'Event Convena',
        alreadyCheckedIn: Boolean(res.alreadyCheckedIn),
        message:
          res.message ||
          `${res.registration.attendeeName} (${res.registration.ticketCode}) berhasil melakukan presensi kehadiran!`,
        registration: res.registration,
        timestamp: new Date().toISOString(),
      })
    }
    return res
  }

  emitAttendanceEvent(evt: AttendanceRealtimeEvent): void {
    if (typeof window === 'undefined') return
    try {
      window.dispatchEvent(new CustomEvent<AttendanceRealtimeEvent>('convena:attendance', { detail: evt }))
    } catch {
      // ignore
    }
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('convena_attendance_events')
        bc.postMessage(evt)
        bc.close()
      }
    } catch {
      // ignore
    }
  }

  subscribeToEventAttendance(
    eventId: string,
    onEvent: (evt: AttendanceRealtimeEvent, latestList?: EventRegistration[]) => void,
    initialRegistrations: EventRegistration[] = []
  ): () => void {
    let closed = false
    const recentFingerprints = new Map<string, number>()
    const knownStatusById = new Map<string, string>()

    for (const reg of initialRegistrations) {
      knownStatusById.set(reg.id, reg.status)
    }

    const deliver = (evt: AttendanceRealtimeEvent, latestList?: EventRegistration[]) => {
      if (closed || !evt || evt.eventId !== eventId || !evt.registration) return
      const fp = `${evt.eventType}:${evt.registration.id}:${evt.registration.status}:${evt.alreadyCheckedIn ? 'repeat' : 'first'}`
      const now = Date.now()
      const prevTime = recentFingerprints.get(fp)
      if (prevTime && now - prevTime < 3500) {
        return
      }
      recentFingerprints.set(fp, now)
      knownStatusById.set(evt.registration.id, evt.registration.status)
      onEvent(evt, latestList)
    }

    let eventSource: EventSource | null = null
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const streamUrl = `${baseUrl.replace(/\/$/, '')}/events/${eventId}/attendance-stream`
        eventSource = new EventSource(streamUrl)

        const handleSsePayload = (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data) as AttendanceRealtimeEvent
            if (parsed && parsed.registration) {
              deliver(parsed)
            }
          } catch {
            // ignore malformed frame
          }
        }

        eventSource.addEventListener('attendance.checked_in', handleSsePayload as EventListener)
        eventSource.addEventListener('registration.created', handleSsePayload as EventListener)
        eventSource.onmessage = handleSsePayload
      } catch {
        // Fallback to BroadcastChannel + delta sync
      }
    }

    const handleDomEvent = (e: globalThis.Event) => {
      const custom = e as CustomEvent<AttendanceRealtimeEvent>
      if (custom.detail) {
        deliver(custom.detail)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('convena:attendance', handleDomEvent)
    }

    let bc: BroadcastChannel | null = null
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('convena_attendance_events')
        bc.onmessage = (msg: MessageEvent<AttendanceRealtimeEvent>) => {
          if (msg.data) {
            deliver(msg.data)
          }
        }
      } catch {
        // ignore
      }
    }

    const pollInterval = setInterval(async () => {
      if (closed) return
      try {
        const latest = await this.getEventRegistrations(eventId)
        if (closed || !Array.isArray(latest)) return

        for (const reg of latest) {
          const prevStatus = knownStatusById.get(reg.id)
          if (!prevStatus) {
            knownStatusById.set(reg.id, reg.status)
            if (reg.status === 'checked_in') {
              deliver(
                {
                  eventType: 'attendance.checked_in',
                  eventId,
                  eventTitle: 'Event Convena',
                  alreadyCheckedIn: false,
                  message: `${reg.attendeeName} (${reg.ticketCode}) berhasil melakukan presensi kehadiran!`,
                  registration: reg,
                  timestamp: reg.checkedInAt || new Date().toISOString(),
                },
                latest
              )
            } else {
              deliver(
                {
                  eventType: 'registration.created',
                  eventId,
                  eventTitle: 'Event Convena',
                  alreadyCheckedIn: false,
                  message: `Peserta baru terdaftar: ${reg.attendeeName} (${reg.tierName})`,
                  registration: reg,
                  timestamp: reg.createdAt || new Date().toISOString(),
                },
                latest
              )
            }
          } else if (prevStatus !== 'checked_in' && reg.status === 'checked_in') {
            knownStatusById.set(reg.id, reg.status)
            deliver(
              {
                eventType: 'attendance.checked_in',
                eventId,
                eventTitle: 'Event Convena',
                alreadyCheckedIn: false,
                message: `${reg.attendeeName} (${reg.ticketCode}) berhasil melakukan presensi kehadiran!`,
                registration: reg,
                timestamp: reg.checkedInAt || new Date().toISOString(),
              },
              latest
            )
          } else {
            knownStatusById.set(reg.id, reg.status)
          }
        }
      } catch {
      }
    }, 2500)

    return () => {
      closed = true
      clearInterval(pollInterval)
      if (eventSource) {
        eventSource.close()
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('convena:attendance', handleDomEvent)
      }
      if (bc) {
        bc.close()
      }
    }
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