export interface EventAttendee {
  id: string
  registrationId: string
  name: string
  email: string
  ticketTierName: string
  quantity: number
  status: 'confirmed' | 'checked_in' | 'cancelled'
  registeredAt: string
  checkedInAt?: string
}

export type CommitteeTaskStatus = 'todo' | 'in_progress' | 'done'
export type CommitteeTaskPriority = 'low' | 'medium' | 'high'

export interface CommitteeTask {
  id: string
  eventId: string
  title: string
  description?: string
  assigneeName: string
  assigneeEmail?: string
  dueDate?: string
  status: CommitteeTaskStatus
  priority: CommitteeTaskPriority
}

export interface CreateCommitteeTaskInput {
  title: string
  description?: string
  assigneeName: string
  assigneeEmail?: string
  dueDate?: string
  priority: CommitteeTaskPriority
}

export interface CheckInResult {
  registrationId: string
  attendeeName: string
  checkedInAt: string
  status: 'checked_in'
}
