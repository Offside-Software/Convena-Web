import type {
  CommitteeTask,
  CommitteeTaskStatus,
  CreateCommitteeTaskInput,
} from '../types/task.ts'

const STORAGE_KEY = 'convena_committee_tasks'

function isCommitteeTask(value: unknown): value is CommitteeTask {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<CommitteeTask>
  return (
    typeof task.id === 'string' &&
    typeof task.eventId === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.assignee === 'string' &&
    typeof task.dueDate === 'string' &&
    (task.status === 'todo' || task.status === 'in_progress' || task.status === 'completed') &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  )
}

function readTasks(): CommitteeTask[] {
  const storedTasks = localStorage.getItem(STORAGE_KEY)
  if (!storedTasks) return []

  const parsedTasks: unknown = JSON.parse(storedTasks)
  if (!Array.isArray(parsedTasks) || !parsedTasks.every(isCommitteeTask)) {
    throw new Error('Data task tersimpan tidak valid. Hapus data task browser dan coba lagi.')
  }

  return parsedTasks
}

function writeTasks(tasks: CommitteeTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export class TasksService {
  getTasks(eventId?: string): CommitteeTask[] {
    const tasks = readTasks()
    return eventId ? tasks.filter((task) => task.eventId === eventId) : tasks
  }

  createTask(input: CreateCommitteeTaskInput): CommitteeTask {
    const now = new Date().toISOString()
    const task: CommitteeTask = {
      ...input,
      id: crypto.randomUUID(),
      status: 'todo',
      createdAt: now,
      updatedAt: now,
    }

    writeTasks([...readTasks(), task])
    return task
  }

  updateTaskStatus(taskId: string, status: CommitteeTaskStatus): CommitteeTask[] {
    const tasks = readTasks()
    const taskExists = tasks.some((task) => task.id === taskId)
    if (!taskExists) {
      throw new Error('Task tidak ditemukan. Muat ulang halaman dan coba lagi.')
    }

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task
    )
    writeTasks(updatedTasks)
    return updatedTasks
  }

  deleteTask(taskId: string): CommitteeTask[] {
    const tasks = readTasks()
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    if (updatedTasks.length === tasks.length) {
      throw new Error('Task tidak ditemukan. Muat ulang halaman dan coba lagi.')
    }

    writeTasks(updatedTasks)
    return updatedTasks
  }
}

export const tasksService = new TasksService()
