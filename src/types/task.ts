export type CommitteeTaskStatus = 'todo' | 'in_progress' | 'completed'

export interface CommitteeTask {
  id: string
  eventId: string
  title: string
  description: string
  assigneeId?: string | null
  assignee: string
  division: string
  dueDate: string
  status: CommitteeTaskStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCommitteeTaskInput {
  eventId: string
  title: string
  description: string
  assigneeId?: string | null
  assignee: string
  division: string
  dueDate: string
}
