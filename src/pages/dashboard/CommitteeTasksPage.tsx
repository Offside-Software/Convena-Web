import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { eventsService } from '../../services/events.service.ts'
import { operationsService } from '../../services/operations.service.ts'
import type { Event } from '../../types/event.ts'
import type { CommitteeTask, CommitteeTaskPriority, CommitteeTaskStatus } from '../../types/operations.ts'

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return 'Terjadi kesalahan saat mengelola tugas.'
}

const statusLabels: Record<CommitteeTaskStatus, string> = {
  todo: 'Belum dimulai',
  in_progress: 'Sedang dikerjakan',
  done: 'Selesai',
}

export const CommitteeTasksPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const requestedEventId = searchParams.get('eventId') || ''
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState(requestedEventId)
  const [tasks, setTasks] = useState<CommitteeTask[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(Boolean(requestedEventId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<CommitteeTaskPriority>('medium')

  useEffect(() => {
    let active = true
    eventsService.getMyEvents()
      .then((result) => {
        if (active) {
          setEvents(result)
          const nextEventId = result.some((event) => event.id === requestedEventId)
            ? requestedEventId
            : (result[0]?.id || '')
          if (nextEventId) setLoadingTasks(true)
          setSelectedEventId(nextEventId)
        }
      })
      .catch((cause: unknown) => { if (active) setError(getErrorMessage(cause)) })
      .finally(() => { if (active) setLoadingEvents(false) })
    return () => { active = false }
  }, [requestedEventId])

  useEffect(() => {
    if (!selectedEventId) {
      return
    }
    let active = true
    operationsService.getTasks(selectedEventId)
      .then((result) => { if (active) setTasks(result) })
      .catch((cause: unknown) => {
        if (active) {
          setTasks([])
          setError(getErrorMessage(cause))
        }
      })
      .finally(() => { if (active) setLoadingTasks(false) })
    return () => { active = false }
  }, [selectedEventId])

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEventId || !title.trim() || !assigneeName.trim()) return
    setSaving(true)
    setError('')
    try {
      const task = await operationsService.createTask(selectedEventId, {
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeName: assigneeName.trim(),
        assigneeEmail: assigneeEmail.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      })
      setTasks((current) => [task, ...current])
      setTitle('')
      setDescription('')
      setAssigneeName('')
      setAssigneeEmail('')
      setDueDate('')
      setPriority('medium')
    } catch (cause: unknown) {
      setError(getErrorMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (task: CommitteeTask, status: CommitteeTaskStatus) => {
    try {
      const updated = await operationsService.updateTaskStatus(selectedEventId, task.id, status)
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item))
    } catch (cause: unknown) {
      setError(getErrorMessage(cause))
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await operationsService.deleteTask(selectedEventId, taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
    } catch (cause: unknown) {
      setError(getErrorMessage(cause))
    }
  }

  return (
    <div className="font-['Montserrat',sans-serif] text-white">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="accent">OPERASIONAL ACARA</Badge>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Tugas Panitia</h1>
          <p className="mt-1 text-sm text-[#9C9C9C]">Bagikan pekerjaan ke panitia dan pantau progres penyelesaiannya.</p>
        </div>
        <select
          aria-label="Pilih acara"
          value={selectedEventId}
          disabled={loadingEvents}
          onChange={(event) => {
            setTasks([])
            setError('')
            setLoadingTasks(Boolean(event.target.value))
            setSelectedEventId(event.target.value)
          }}
          className="min-w-52 rounded-lg border border-[#3D3D3D] bg-[#151515] px-3 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]"
        >
          <option value="">Pilih acara</option>
          {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">{error}</p>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-[#262626] bg-[#151515]">
          <div className="flex items-center gap-2 border-b border-[#262626] p-4 text-sm font-bold">
            <ClipboardList size={17} className="text-[#CFFE06]" /> Daftar Tugas
            <span className="ml-auto text-xs font-medium text-[#9C9C9C]">{tasks.length} tugas</span>
          </div>
          {loadingEvents || loadingTasks ? (
            <p className="p-8 text-center text-sm text-[#9C9C9C]">Memuat tugas...</p>
          ) : !selectedEventId ? (
            <p className="p-8 text-center text-sm text-[#9C9C9C]">Pilih atau buat acara terlebih dahulu.</p>
          ) : tasks.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#9C9C9C]">Belum ada tugas untuk acara ini.</p>
          ) : (
            <div className="divide-y divide-[#262626]">
              {tasks.map((task) => (
                <article key={task.id} className="flex flex-wrap items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={`m-0 text-sm font-bold ${task.status === 'done' ? 'text-[#777] line-through' : 'text-white'}`}>{task.title}</h2>
                      <Badge variant={task.priority === 'high' ? 'pink' : task.priority === 'low' ? 'dark' : 'accent'}>
                        {task.priority === 'high' ? 'Prioritas tinggi' : task.priority === 'low' ? 'Prioritas rendah' : 'Prioritas sedang'}
                      </Badge>
                    </div>
                    {task.description && <p className="mb-0 mt-2 text-xs leading-relaxed text-[#9C9C9C]">{task.description}</p>}
                    <div className="mt-2 text-[11px] text-[#9C9C9C]">
                      PIC: <span className="text-white">{task.assigneeName}</span>
                      {task.assigneeEmail && <span> · {task.assigneeEmail}</span>}
                      {task.dueDate && <span> · Tenggat {new Date(task.dueDate).toLocaleDateString('id-ID')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`Status tugas ${task.title}`}
                      value={task.status}
                      onChange={(event) => handleStatusChange(task, event.target.value as CommitteeTaskStatus)}
                      className="max-w-40 rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-2 py-2 text-[11px] text-white outline-none focus:border-[#CFFE06]"
                    >
                      {(Object.keys(statusLabels) as CommitteeTaskStatus[]).map((status) => (
                        <option key={status} value={status}>{statusLabels[status]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Hapus tugas ${task.title}`}
                      className="rounded-lg border border-[#3D3D3D] p-2 text-[#9C9C9C] hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleCreateTask} className="space-y-3 rounded-xl border border-[#262626] bg-[#151515] p-4">
          <h2 className="m-0 flex items-center gap-2 text-sm font-bold"><Plus size={16} className="text-[#CFFE06]" /> Tambah Tugas</h2>
          <label className="block text-xs text-[#9C9C9C]">Nama tugas
            <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]" placeholder="Contoh: Siapkan meja registrasi" />
          </label>
          <label className="block text-xs text-[#9C9C9C]">Deskripsi
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]" placeholder="Rincian pekerjaan..." />
          </label>
          <label className="block text-xs text-[#9C9C9C]">Nama panitia (PIC)
            <input required value={assigneeName} onChange={(event) => setAssigneeName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]" placeholder="Nama yang bertanggung jawab" />
          </label>
          <label className="block text-xs text-[#9C9C9C]">Email PIC (opsional)
            <input type="email" value={assigneeEmail} onChange={(event) => setAssigneeEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]" placeholder="panitia@acara.id" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[#9C9C9C]">Tenggat
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-2 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]" />
            </label>
            <label className="block text-xs text-[#9C9C9C]">Prioritas
              <select value={priority} onChange={(event) => setPriority(event.target.value as CommitteeTaskPriority)} className="mt-1.5 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-2 py-2.5 text-xs text-white outline-none focus:border-[#CFFE06]">
                <option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={!selectedEventId || saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#CFFE06] px-4 py-3 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={15} /> {saving ? 'Menyimpan...' : 'Buat Tugas'}
          </button>
        </form>
      </div>
    </div>
  )
}
