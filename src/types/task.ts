export type CommitteeTaskStatus = 'todo' | 'in_progress' | 'completed'

export interface CommitteeTask {
  id: string
  eventId: string
  title: string
  description: string
  assignee: string
  dueDate: string
  status: CommitteeTaskStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCommitteeTaskInput {
  eventId: string
  title: string
  description: string
  assignee: string
  dueDate: string
}
