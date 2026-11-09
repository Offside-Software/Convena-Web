import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  UserRound,
  Layers,
} from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Select } from '../../components/common/Select.tsx'
import { eventsService } from '../../services/events.service.ts'
import { tasksService } from '../../services/tasks.service.ts'
import type { Event } from '../../types/event.ts'
import type { EventMember } from '../../types/membership.ts'
import type { CommitteeTask, CommitteeTaskStatus } from '../../types/task.ts'

const TASK_STATUSES: { value: CommitteeTaskStatus; label: string }[] = [
  { value: 'todo', label: 'Belum Dimulai' },
  { value: 'in_progress', label: 'Sedang Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
]

const DIVISION_OPTIONS = [
  'BPH / Inti',
  'Divisi Acara',
  'Divisi Logistik & Perlengkapan',
  'Divisi Humas & Publikasi',
  'Divisi Sponsorship & Fundraising',
  'Divisi Keuangan & SPJ',
  'Divisi IT & Multimedia',
  'Divisi Konsumsi',
  'Divisi Keamanan & Medis',
]

function formatDueDate(date: string): string {
  if (!date) return '-'
  const d = new Date(`${date.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('id-ID', {
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
  const [tasks, setTasks] = useState<CommitteeTask[]>([])
  const [eventMembers, setEventMembers] = useState<EventMember[]>([])
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [view, setView] = useState<'board' | 'list'>('board')
  const [showForm, setShowForm] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [error, setError] = useState('')

  // New Task Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [assignee, setAssignee] = useState('')
  const [division, setDivision] = useState(DIVISION_OPTIONS[1])
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

  useEffect(() => {
    if (!selectedEventId) {
      setTasks([])
      setEventMembers([])
      return
    }
    let active = true
    setLoadingTasks(true)
    Promise.all([
      tasksService.getTasks(selectedEventId).catch(() => [] as CommitteeTask[]),
      eventsService.getEventMembers(selectedEventId).catch(() => [] as EventMember[]),
    ])
      .then(([loadedTasks, loadedMembers]) => {
        if (!active) return
        setTasks(loadedTasks)
        setEventMembers(loadedMembers)
        if (loadedMembers.length > 0 && !assignee) {
          setAssigneeId(loadedMembers[0].userId)
          setAssignee(loadedMembers[0].displayName)
          if (loadedMembers[0].division) {
            setDivision(loadedMembers[0].division)
          }
        }
      })
      .finally(() => {
        if (active) setLoadingTasks(false)
      })
    return () => {
      active = false
    }
  }, [selectedEventId])

  const filteredTasks = useMemo(
    () =>
      divisionFilter === 'all'
        ? tasks
        : tasks.filter((t) => t.division === divisionFilter),
    [tasks, divisionFilter]
  )

  const selectedEvent = events.find((event) => event.id === selectedEventId)
  const taskCounts = useMemo(
    () => ({
      total: filteredTasks.length,
      todo: filteredTasks.filter((task) => task.status === 'todo').length,
      inProgress: filteredTasks.filter((task) => task.status === 'in_progress').length,
      completed: filteredTasks.filter((task) => task.status === 'completed').length,
    }),
    [filteredTasks]
  )

  const availableDivisions = useMemo(() => {
    const divs = new Set<string>()
    for (const t of tasks) {
      if (t.division) divs.add(t.division)
    }
    for (const m of eventMembers) {
      if (m.division) divs.add(m.division)
    }
    return Array.from(divs)
  }, [tasks, eventMembers])

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEventId) {
      setError('Pilih event terlebih dahulu sebelum membuat task.')
      return
    }

    try {
      const created = await tasksService.createTask({
        eventId: selectedEventId,
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        assignee: assignee.trim(),
        division: division.trim() || 'Umum',
        dueDate,
      })
      setTasks((curr) => [created, ...curr])
      setTitle('')
      setDescription('')
      setDueDate('')
      setShowForm(false)
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Task gagal disimpan.')
    }
  }

  const handleStatusChange = async (taskId: string, status: CommitteeTaskStatus) => {
    if (!selectedEventId) return
    try {
      const updated = await tasksService.updateTaskStatus(selectedEventId, taskId, status)
      setTasks((curr) => curr.map((t) => (t.id === taskId ? updated : t)))
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Status task gagal diperbarui.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedEventId) return
    try {
      await tasksService.deleteTask(selectedEventId, taskId)
      setTasks((curr) => curr.filter((t) => t.id !== taskId))
      setError('')
    } catch (taskError: unknown) {
      setError(taskError instanceof Error ? taskError.message : 'Task gagal dihapus.')
    }
  }

  const renderTask = (task: CommitteeTask) => (
    <article key={task.id} className="bg-[#151515] border border-[#303030] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="dark" className="text-[10px]">
            {task.division || 'Umum'}
          </Badge>
          <h3 className="text-sm font-bold text-white m-0 break-words">{task.title}</h3>
        </div>
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
      {task.description && (
        <p className="text-xs text-[#9C9C9C] m-0 whitespace-pre-line">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#9C9C9C]">
        <span className="flex items-center gap-1.5">
          <UserRound size={13} className="text-[#CFFE06]" />
          {task.assignee}
        </span>
        <span className={`flex items-center gap-1.5 ${isOverdue(task) ? 'text-[#DF00D0]' : ''}`}>
          <CalendarDays
            size={13}
            className={isOverdue(task) ? 'text-[#DF00D0]' : 'text-[#CFFE06]'}
          />
          {formatDueDate(task.dueDate)}
          {isOverdue(task) && ' · Terlambat'}
        </span>
      </div>
      <Select
        id={`task-status-${task.id}`}
        aria-label={`Status task ${task.title}`}
        value={task.status}
        onChange={(val) => handleStatusChange(task.id, val as CommitteeTaskStatus)}
        options={TASK_STATUSES}
        size="sm"
        variant="surface"
        className="!w-auto !mb-0"
        fullWidth={false}
      />
    </article>
  )

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="mb-2">
            <Badge variant="accent">MANAJEMEN TASK PANITIA PER EVENT</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Task Panitia Event
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Setiap event memiliki manajemen tugas panitia tersendiri yang terhubung dengan susunan anggota & divisi event.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          icon={<Plus size={15} />}
          disabled={!selectedEventId}
          onClick={() => setShowForm((open) => !open)}
        >
          {showForm ? 'Tutup Form' : 'Buat Task Baru'}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#DF00D0]/40 bg-[#DF00D0]/10 p-3 mb-5 text-xs text-[#ff80f3]"
        >
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-5 mb-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white m-0">
              Buat Task Panitia — {selectedEvent?.title}
            </h2>
            <Badge variant="accent" className="text-[10px]">
              Tersinkron ke Database Event
            </Badge>
          </div>

          {eventMembers.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1.5">
                Pilih Cepat Penanggung Jawab dari Panitia Event Ini:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {eventMembers.map((m) => (
                  <button
                    key={m.userId}
                    type="button"
                    onClick={() => {
                      setAssigneeId(m.userId)
                      setAssignee(m.displayName)
                      if (m.division) setDivision(m.division)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      assignee === m.displayName
                        ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                        : 'bg-[#202020] text-[#CCCCCC] border-[#333333] hover:border-[#CFFE06]/50'
                    }`}
                  >
                    {m.displayName} ({m.division || m.role})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
              >
                Nama Tugas *
              </label>
              <input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={150}
                placeholder="Contoh: Finalisasi izin penggunaan gedung & bandwidth"
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
              />
            </div>

            <div>
              <label
                htmlFor="task-assignee"
                className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
              >
                Penanggung Jawab (PIC) *
              </label>
              <input
                id="task-assignee"
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                required
                maxLength={100}
                placeholder="Nama anggota panitia"
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
              />
            </div>

            <div>
              <label
                htmlFor="task-division"
                className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
              >
                Divisi Kepanitiaan *
              </label>
              <select
                id="task-division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
              >
                {DIVISION_OPTIONS.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-due-date"
                className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
              >
                Tenggat Waktu *
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="task-description"
                className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
              >
                Deskripsi & Catatan Teknis (Opsional)
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Rincian deliverable atau koordinasi lintas divisi..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
              />
            </div>
          </div>
          <Button type="submit" variant="accent" size="sm" icon={<Plus size={14} />}>
            Simpan Task ke Event
          </Button>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="task-event" className="text-xs font-semibold text-[#9C9C9C]">
            Event:
          </label>
          <div className="min-w-64">
            <Select
              id="task-event"
              value={selectedEventId}
              onChange={(val) => {
                setSelectedEventId(val)
                setDivisionFilter('all')
              }}
              disabled={loadingEvents || events.length === 0}
              options={
                events.length === 0
                  ? [{ label: 'Tidak ada event', value: '' }]
                  : events.map((event) => ({
                      label: `${event.title} (${event.organizationName || 'Organisasi'})`,
                      value: event.id,
                    }))
              }
              size="sm"
              variant="surface"
              className="!mb-0"
              fullWidth={false}
            />
          </div>

          {availableDivisions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Layers size={14} className="text-[#CFFE06] ml-1" />
              <button
                type="button"
                onClick={() => setDivisionFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                  divisionFilter === 'all'
                    ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                    : 'bg-[#202020] text-[#9C9C9C] border-[#333333]'
                }`}
              >
                Semua Divisi
              </button>
              {availableDivisions.map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => setDivisionFilter(div)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                    divisionFilter === div
                      ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                      : 'bg-[#202020] text-[#9C9C9C] border-[#333333]'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setView('board')}
            aria-pressed={view === 'board'}
            className={`p-2 rounded-lg border cursor-pointer ${
              view === 'board'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#202020] text-[#9C9C9C] border-[#3D3D3D]'
            }`}
            title="Tampilan Kanban"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={`p-2 rounded-lg border cursor-pointer ${
              view === 'list'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#202020] text-[#9C9C9C] border-[#3D3D3D]'
            }`}
            title="Tampilan daftar"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-[#9C9C9C]">
          <span className="flex items-center gap-1.5">
            <ClipboardList size={14} className="text-[#CFFE06]" />
            {taskCounts.total} total task
          </span>
          <span>{taskCounts.todo} belum dimulai</span>
          <span>{taskCounts.inProgress} sedang dikerjakan</span>
          <span>{taskCounts.completed} selesai</span>
          {loadingTasks && <span className="text-[#CFFE06]">Menyinkronkan...</span>}
        </div>
      )}

      {!loadingEvents && events.length === 0 ? (
        <div className="text-center bg-[#151515] border border-[#3D3D3D]/50 rounded-xl p-10">
          <h2 className="text-lg font-bold text-white mb-2">Belum ada event</h2>
          <p className="text-xs text-[#9C9C9C] mb-5">
            Buat event terlebih dahulu untuk mulai mengatur task panitia.
          </p>
          <Link to="/dashboard/events/create" className="no-underline">
            <Button variant="accent" size="sm">
              Buat Event
            </Button>
          </Link>
        </div>
      ) : view === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {TASK_STATUSES.map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status.value)
            return (
              <section
                key={status.value}
                className="bg-[#101010] border border-[#262626] rounded-xl p-3 min-h-48"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <h2 className="text-sm font-bold text-white m-0">{status.label}</h2>
                  <span className="text-[11px] text-[#9C9C9C] bg-[#202020] rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map(renderTask)}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-[#707070] text-center py-7">Belum ada task</p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#151515] border border-[#3D3D3D]/50 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="text-[#9C9C9C] border-b border-[#303030]">
              <tr>
                <th className="px-4 py-3 font-semibold">Tugas</th>
                <th className="px-4 py-3 font-semibold">Divisi</th>
                <th className="px-4 py-3 font-semibold">Penanggung Jawab</th>
                <th className="px-4 py-3 font-semibold">Tenggat</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-[#262626] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{task.title}</div>
                    {task.description && (
                      <div className="text-[#9C9C9C] mt-1">{task.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="dark" className="text-[10px]">
                      {task.division || 'Umum'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#CFFE06]">{task.assignee}</td>
                  <td
                    className={`px-4 py-3 ${
                      isOverdue(task) ? 'text-[#DF00D0]' : 'text-[#9C9C9C]'
                    }`}
                  >
                    {formatDueDate(task.dueDate)}
                    {isOverdue(task) && ' · Terlambat'}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      aria-label={`Status task ${task.title}`}
                      value={task.status}
                      onChange={(val) => handleStatusChange(task.id, val as CommitteeTaskStatus)}
                      options={TASK_STATUSES}
                      size="sm"
                      variant="surface"
                      className="!w-auto !mb-0"
                      fullWidth={false}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-[#777] hover:text-[#DF00D0] bg-transparent border-none p-1 cursor-pointer"
                      aria-label={`Hapus task ${task.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#707070]">
                    Belum ada task untuk event ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
