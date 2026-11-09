import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { eventsService } from '../../services/events.service.ts'
import { tasksService } from '../../services/tasks.service.ts'
import type { Event } from '../../types/event.ts'
import type { CommitteeTask, CommitteeTaskStatus } from '../../types/task.ts'

const TASK_STATUSES: { value: CommitteeTaskStatus; label: string }[] = [
  { value: 'todo', label: 'Belum Dimulai' },
  { value: 'in_progress', label: 'Sedang Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
]

const STATUS_STYLES: Record<CommitteeTaskStatus, string> = {
  todo: 'bg-[#202020] text-[#9C9C9C]',
  in_progress: 'bg-[#CFFE06]/15 text-[#CFFE06]',
  completed: 'bg-emerald-500/15 text-emerald-400',
}

function formatDueDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isOverdue(task: CommitteeTask): boolean {
  return task.status !== 'completed' && task.dueDate < new Date().toISOString().slice(0, 10)
}

export const TaskManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const requestedEventId = searchParams.get('eventId') || ''
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState(requestedEventId)
  const [storedTasks, setStoredTasks] = useState(() => {
    try {
      return { tasks: tasksService.getTasks(), error: '' }
    } catch (taskError: unknown) {
      return {
        tasks: [] as CommitteeTask[],
        error: taskError instanceof Error
          ? taskError.message
          : 'Data task gagal dimuat dari penyimpanan browser.',
      }
    }
  })
  const [view, setView] = useState<'board' | 'list'>('board')
  const [showForm, setShowForm] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    let active = true
    const loadEvents = async () => {
      try {
        let availableEvents = await eventsService.getMyEvents()
        if (availableEvents.length === 0) {
          availableEvents = await eventsService.getEvents()
        }
        if (!active) return
        setEvents(availableEvents)
        const eventId = availableEvents.some((event) => event.id === requestedEventId)
          ? requestedEventId
          : availableEvents[0]?.id || ''
        setSelectedEventId(eventId)
      } catch {
        if (active) setError('Event gagal dimuat. Silakan muat ulang halaman.')
      } finally {
        if (active) setLoadingEvents(false)
      }
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [requestedEventId])

  const tasks = useMemo(
    () => selectedEventId
      ? storedTasks.tasks.filter((task) => task.eventId === selectedEventId)
      : storedTasks.tasks,
    [selectedEventId, storedTasks.tasks]
  )

  const selectedEvent = events.find((event) => event.id === selectedEventId)
  const taskCounts = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
    }),
    [tasks]
  )

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEventId) {
      setError('Pilih event terlebih dahulu sebelum membuat task.')
      return
    }

    try {
      const task = tasksService.createTask({
        eventId: selectedEventId,
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        dueDate,
      })
      setStoredTasks((current) => ({ tasks: [...current.tasks, task], error: '' }))
      setTitle('')
      setDescription('')
      setAssignee('')
      setDueDate('')
      setShowForm(false)
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Task gagal disimpan.')
    }
  }

  const handleStatusChange = (taskId: string, status: CommitteeTaskStatus) => {
    try {
      const updatedTasks = tasksService.updateTaskStatus(taskId, status)
      setStoredTasks((current) => ({ ...current, tasks: updatedTasks }))
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Status task gagal diperbarui.')
    }
  }

  const handleDeleteTask = (taskId: string) => {
    try {
      const updatedTasks = tasksService.deleteTask(taskId)
      setStoredTasks((current) => ({ ...current, tasks: updatedTasks }))
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Task gagal dihapus.')
    }
  }

  const renderTask = (task: CommitteeTask) => (
    <article key={task.id} className="bg-[#151515] border border-[#303030] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-white m-0 break-words">{task.title}</h3>
        <button
          type="button"
          onClick={() => handleDeleteTask(task.id)}
          className="text-[#777] hover:text-[#DF00D0] bg-transparent border-none p-1 cursor-pointer"
          aria-label={`Hapus task ${task.title}`}
          title="Hapus task"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {task.description && <p className="text-xs text-[#9C9C9C] m-0 whitespace-pre-line">{task.description}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#9C9C9C]">
        <span className="flex items-center gap-1.5">
          <UserRound size={13} className="text-[#CFFE06]" />
          {task.assignee}
        </span>
        <span className={`flex items-center gap-1.5 ${isOverdue(task) ? 'text-[#DF00D0]' : ''}`}>
          <CalendarDays size={13} className={isOverdue(task) ? 'text-[#DF00D0]' : 'text-[#CFFE06]'} />
          {formatDueDate(task.dueDate)}
          {isOverdue(task) && ' · Terlambat'}
        </span>
      </div>
      <label className="sr-only" htmlFor={`task-status-${task.id}`}>Status task {task.title}</label>
      <select
        id={`task-status-${task.id}`}
        value={task.status}
        onChange={(event) => handleStatusChange(task.id, event.target.value as CommitteeTaskStatus)}
        className={`!w-auto !rounded-full !border-0 !py-1 !pl-3 !pr-8 !text-[11px] !font-bold ${STATUS_STYLES[task.status]}`}
      >
        {TASK_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>{status.label}</option>
        ))}
      </select>
    </article>
  )

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="mb-2"><Badge variant="accent">MANAJEMEN PANITIA</Badge></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">Task Panitia</h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Atur penanggung jawab, tenggat, dan progres tugas event.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          icon={<Plus size={15} />}
          disabled={!selectedEventId}
          onClick={() => setShowForm((open) => !open)}
        >
          {showForm ? 'Tutup Form' : 'Buat Task'}
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-[#3D3D3D]/60 bg-[#151515] p-3.5 mb-5 text-xs text-[#9C9C9C]">
        <AlertCircle size={15} className="text-[#CFFE06] shrink-0 mt-0.5" />
        <p className="m-0">
          Prototype: task tersimpan di browser ini saja dan belum tersinkron ke perangkat anggota panitia lain.
          Penanggung jawab diisi manual karena daftar anggota belum tersedia di frontend.
        </p>
      </div>

      {(error || storedTasks.error) && (
        <div role="alert" className="rounded-xl border border-[#DF00D0]/40 bg-[#DF00D0]/10 p-3 mb-5 text-xs text-[#ff80f3]">
          {error || storedTasks.error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateTask} className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-5 mb-5 space-y-4">
          <h2 className="text-base font-bold text-white m-0">Task Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-title" className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">Nama tugas</label>
              <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} placeholder="Contoh: Siapkan rundown acara" />
            </div>
            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">Penanggung jawab</label>
              <input id="task-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} required maxLength={100} placeholder="Nama anggota panitia" />
            </div>
            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">Tenggat waktu</label>
              <input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="task-description" className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">Deskripsi (opsional)</label>
              <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} maxLength={1000} placeholder="Rincian atau catatan tugas" />
            </div>
          </div>
          <Button type="submit" variant="accent" size="sm" icon={<Plus size={14} />}>Simpan Task</Button>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="task-event" className="text-xs font-semibold text-[#9C9C9C]">Event:</label>
          <select
            id="task-event"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            disabled={loadingEvents || events.length === 0}
            className="!w-auto min-w-56"
          >
            {events.length === 0 && <option value="">Tidak ada event</option>}
            {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setView('board')} aria-pressed={view === 'board'} className={`p-2 rounded-lg border cursor-pointer ${view === 'board' ? 'bg-[#CFFE06] text-black border-[#CFFE06]' : 'bg-[#202020] text-[#9C9C9C] border-[#3D3D3D]'}`} title="Tampilan Kanban">
            <LayoutGrid size={16} />
          </button>
          <button type="button" onClick={() => setView('list')} aria-pressed={view === 'list'} className={`p-2 rounded-lg border cursor-pointer ${view === 'list' ? 'bg-[#CFFE06] text-black border-[#CFFE06]' : 'bg-[#202020] text-[#9C9C9C] border-[#3D3D3D]'}`} title="Tampilan daftar">
            <List size={16} />
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-[#9C9C9C]">
          <span className="flex items-center gap-1.5"><ClipboardList size={14} className="text-[#CFFE06]" />{taskCounts.total} total</span>
          <span>{taskCounts.todo} belum dimulai</span>
          <span>{taskCounts.inProgress} sedang dikerjakan</span>
          <span>{taskCounts.completed} selesai</span>
        </div>
      )}

      {!loadingEvents && events.length === 0 ? (
        <div className="text-center bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-10">
          <h2 className="text-lg font-bold text-white mb-2">Belum ada event</h2>
          <p className="text-xs text-[#9C9C9C] mb-5">Buat event terlebih dahulu untuk mulai mengatur task panitia.</p>
          <Link to="/dashboard/events/create" className="no-underline">
            <Button variant="accent" size="sm">Buat Event</Button>
          </Link>
        </div>
      ) : view === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {TASK_STATUSES.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status.value)
            return (
              <section key={status.value} className="bg-[#101010] border border-[#262626] rounded-xl p-3 min-h-48">
                <div className="flex items-center justify-between px-1 pb-3">
                  <h2 className="text-sm font-bold text-white m-0">{status.label}</h2>
                  <span className="text-[11px] text-[#9C9C9C] bg-[#202020] rounded-full px-2 py-0.5">{columnTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map(renderTask)}
                  {columnTasks.length === 0 && <p className="text-xs text-[#707070] text-center py-7">Belum ada task</p>}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#151515] border border-[#3D3D3D]/50 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="text-[#9C9C9C] border-b border-[#303030]">
              <tr>
                <th className="px-4 py-3 font-semibold">Tugas</th>
                <th className="px-4 py-3 font-semibold">Penanggung Jawab</th>
                <th className="px-4 py-3 font-semibold">Tenggat</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-[#262626] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{task.title}</div>
                    {task.description && <div className="text-[#9C9C9C] mt-1">{task.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-[#CFFE06]">{task.assignee}</td>
                  <td className={`px-4 py-3 ${isOverdue(task) ? 'text-[#DF00D0]' : 'text-[#9C9C9C]'}`}>
                    {formatDueDate(task.dueDate)}{isOverdue(task) && ' · Terlambat'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status task ${task.title}`}
                      value={task.status}
                      onChange={(event) => handleStatusChange(task.id, event.target.value as CommitteeTaskStatus)}
                      className={`!w-auto !rounded-full !border-0 !py-1 !pl-3 !pr-8 !text-[11px] !font-bold ${STATUS_STYLES[task.status]}`}
                    >
                      {TASK_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleDeleteTask(task.id)} aria-label={`Hapus task ${task.title}`} className="text-[#777] hover:text-[#DF00D0] bg-transparent border-none p-1 cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} className="text-center text-[#707070] py-10">Belum ada task untuk event ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
