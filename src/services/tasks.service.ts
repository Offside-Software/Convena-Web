import { apiClient } from './api/client.ts'
import type {
  CommitteeTask,
  CommitteeTaskStatus,
  CreateCommitteeTaskInput,
} from '../types/task.ts'

function normalizeTask(raw: any): CommitteeTask {
  const statusMap: Record<string, CommitteeTaskStatus> = {
    todo: 'todo',
    in_progress: 'in_progress',
    done: 'completed',
    completed: 'completed',
  }
  return {
    id: String(raw.id),
    eventId: String(raw.eventId),
    title: raw.title || '',
    description: raw.description || '',
    assigneeId: raw.assigneeId || null,
    assignee: raw.assigneeName || raw.assignee || 'Panitia',
    division: raw.division || 'Umum',
    dueDate: raw.dueDate || '',
    status: statusMap[raw.status] || 'todo',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

export class TasksService {
  async getTasks(eventId: string): Promise<CommitteeTask[]> {
    if (!eventId) return []
    const res = await apiClient.get<any[]>(`/events/${eventId}/tasks`)
    if (Array.isArray(res)) {
      return res.map(normalizeTask)
    }
    return []
  }

  async createTask(input: CreateCommitteeTaskInput): Promise<CommitteeTask> {
    const res = await apiClient.post<any>(`/events/${input.eventId}/tasks`, {
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId || null,
      assigneeName: input.assignee,
      division: input.division || 'Umum',
      dueDate: input.dueDate,
      status: 'todo',
    })
    return normalizeTask(res)
  }

  async updateTaskStatus(
    eventId: string,
    taskId: string,
    status: CommitteeTaskStatus
  ): Promise<CommitteeTask> {
    const res = await apiClient.patch<any>(`/events/${eventId}/tasks/${taskId}`, {
      status,
    })
    return normalizeTask(res)
  }

  async deleteTask(eventId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/tasks/${taskId}`)
  }
}

export const tasksService = new TasksService()
