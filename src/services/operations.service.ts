import { apiClient } from './api/client.ts'
import type {
  CheckInResult,
  CommitteeTask,
  CommitteeTaskStatus,
  CreateCommitteeTaskInput,
  EventAttendee,
} from '../types/operations.ts'

export interface CheckInInput {
  qrCode: string
  latitude: number
  longitude: number
  accuracy?: number
}

export class OperationsService {
  getAttendees(eventId: string): Promise<EventAttendee[]> {
    return apiClient.get<EventAttendee[]>(`/events/${eventId}/attendees`)
  }

  getTasks(eventId: string): Promise<CommitteeTask[]> {
    return apiClient.get<CommitteeTask[]>(`/events/${eventId}/tasks`)
  }

  createTask(eventId: string, task: CreateCommitteeTaskInput): Promise<CommitteeTask> {
    return apiClient.post<CommitteeTask>(`/events/${eventId}/tasks`, task)
  }

  updateTaskStatus(
    eventId: string,
    taskId: string,
    status: CommitteeTaskStatus
  ): Promise<CommitteeTask> {
    return apiClient.patch<CommitteeTask>(`/events/${eventId}/tasks/${taskId}`, { status })
  }

  deleteTask(eventId: string, taskId: string): Promise<void> {
    return apiClient.delete<void>(`/events/${eventId}/tasks/${taskId}`)
  }

  checkIn(eventId: string, input: CheckInInput): Promise<CheckInResult> {
    return apiClient.post<CheckInResult>(`/events/${eventId}/check-in`, input)
  }
}

export const operationsService = new OperationsService()
