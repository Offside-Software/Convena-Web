import React, { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Toast, type ToastType } from '../../components/common/Toast.tsx'
import { financeService } from '../../services/finance.service.ts'
import { eventsService } from '../../services/events.service.ts'
import type { Event } from '../../types/event.ts'
import type {
  CreateExpenseInput,
  EventBudgetSummary,
  ExpenseRecord,
  ExpenseCategory,
} from '../../types/finance.ts'
import { BudgetSummaryCards } from './components/BudgetSummaryCards.tsx'
import { BudgetVarianceTracker } from './components/BudgetVarianceTracker.tsx'
import { ExpenseSpjTable } from './components/ExpenseSpjTable.tsx'
import { AddExpenseModal } from './components/AddExpenseModal.tsx'

const FinanceDetailsSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* 4 Budget Summary Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-5 bg-[#151515] border border-[#262626] rounded-xl space-y-3"
        >
          <div className="h-3 w-36 bg-[#242424] rounded" />
          <div className="h-8 w-44 bg-[#242424] rounded-lg" />
          <div className="h-3 w-28 bg-[#202020] rounded" />
        </div>
      ))}
    </div>

    {/* Budget Variance Tracker Skeleton */}
    <div className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-[#202020] border-b border-[#262626]">
        <div className="h-5 w-64 bg-[#2c2c2c] rounded" />
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-[#262626] bg-[#181818] rounded-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-36 bg-[#262626] rounded" />
              <div className="h-4 w-16 bg-[#262626] rounded-full" />
            </div>
            <div className="h-2 w-full bg-[#262626] rounded-full" />
            <div className="space-y-2 pt-1">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-[#242424] rounded" />
                <div className="h-3 w-28 bg-[#242424] rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-[#242424] rounded" />
                <div className="h-3 w-24 bg-[#242424] rounded" />
              </div>
              <div className="flex justify-between pt-1 border-t border-[#262626]">
                <div className="h-3 w-16 bg-[#242424] rounded" />
                <div className="h-3 w-24 bg-[#242424] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Expense SPJ Table Skeleton */}
    <div className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-[#202020] border-b border-[#262626]">
        <div className="h-5 w-72 bg-[#2c2c2c] rounded" />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-24 bg-[#242424] rounded-full" />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between gap-4 py-3 px-3 border-b border-[#202020]"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-56 bg-[#262626] rounded" />
                <div className="h-3 w-40 bg-[#202020] rounded" />
              </div>
              <div className="h-4 w-28 bg-[#242424] rounded hidden sm:block" />
              <div className="h-4 w-28 bg-[#262626] rounded" />
              <div className="h-5 w-24 bg-[#242424] rounded-full hidden md:block" />
              <div className="flex gap-2">
                <div className="h-7 w-16 bg-[#262626] rounded-lg" />
                <div className="h-7 w-8 bg-[#242424] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export const FinancesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryEventId = searchParams.get('eventId')

  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(queryEventId || '')
  const [eventsLoading, setEventsLoading] = useState(true)

  const [budget, setBudget] = useState<EventBudgetSummary | null>(null)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [financeLoading, setFinanceLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null)

  const [toast, setToast] = useState<{
    open: boolean
    type: ToastType
    title: string
    message: string
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  const notify = (type: ToastType, title: string, message: string) => {
    setToast({ open: true, type, title, message })
  }

  // 1. Load events managed by user (or public events if none assigned yet)
  useEffect(() => {
    let isMounted = true

    eventsService
      .getMyEvents()
      .then((myEvts) => {
        if (myEvts.length > 0) return myEvts
        return eventsService.getEvents()
      })
      .then((evts) => {
        if (!isMounted) return
        setEvents(evts)
        if (evts.length > 0) {
          const matching = queryEventId ? evts.find((e) => e.id === queryEventId) : undefined
          const initialId = matching ? matching.id : evts[0].id
          setSelectedEventId(initialId)
          if (initialId !== queryEventId) {
            setSearchParams({ eventId: initialId }, { replace: true })
          }
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg =
          err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
            ? (err as any).message
            : 'Gagal memuat daftar event.'
        setErrorMessage(msg)
      })
      .finally(() => {
        if (isMounted) {
          setEventsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [queryEventId, setSearchParams])

  // 2. Refresh helper for event-specific budget summary & expenses
  const loadFinanceData = useCallback(async (eventId: string) => {
    if (!eventId) return
    setFinanceLoading(true)
    setErrorMessage(null)
    try {
      const [b, exps] = await Promise.all([
        financeService.getBudgetSummary(eventId),
        financeService.getExpenses(eventId),
      ])
      setBudget(b)
      setExpenses(exps)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Gagal memuat data anggaran dan SPJ untuk event ini.'
      setErrorMessage(msg)
    } finally {
      setFinanceLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    let isMounted = true

    Promise.all([
      financeService.getBudgetSummary(selectedEventId),
      financeService.getExpenses(selectedEventId),
    ])
      .then(([b, exps]) => {
        if (!isMounted) return
        setBudget(b)
        setExpenses(exps)
        setErrorMessage(null)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg =
          err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
            ? (err as any).message
            : 'Gagal memuat data anggaran dan SPJ untuk event ini.'
        setErrorMessage(msg)
      })

    return () => {
      isMounted = false
    }
  }, [selectedEventId])

  const handleSelectEvent = (newEventId: string) => {
    if (newEventId === selectedEventId) return
    setBudget(null)
    setExpenses([])
    setSelectedEventId(newEventId)
    setSearchParams({ eventId: newEventId })
  }

  const handleOpenCreateModal = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (expense: ExpenseRecord) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleSubmitExpense = async (expenseData: CreateExpenseInput) => {
    if (!selectedEventId) return
    setErrorMessage(null)
    if (editingExpense) {
      await financeService.updateExpense(selectedEventId, editingExpense.id, expenseData)
      notify(
        'success',
        'Kuitansi Diperbarui',
        `Pengeluaran "${expenseData.title}" berhasil diperbarui.`
      )
    } else {
      await financeService.addExpense(selectedEventId, expenseData)
      notify(
        'success',
        'Kuitansi Berhasil Dicatat',
        `Pengeluaran "${expenseData.title}" sebesar Rp ${expenseData.amount.toLocaleString('id-ID')} telah masuk daftar SPJ.`
      )
    }
    await loadFinanceData(selectedEventId)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!selectedEventId) return
    setErrorMessage(null)
    try {
      await financeService.deleteExpense(selectedEventId, expenseId)
      notify('info', 'Kuitansi Dihapus', 'Data pengeluaran telah dihapus dari catatan event.')
      await loadFinanceData(selectedEventId)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Gagal menghapus pengeluaran.'
      setErrorMessage(msg)
      notify('error', 'Gagal Menghapus', msg)
    }
  }

  const handleUpdateCategoryBudget = async (
    category: ExpenseCategory,
    plannedAmount: number
  ) => {
    if (!selectedEventId) return
    setErrorMessage(null)
    if (Number.isNaN(plannedAmount) || plannedAmount < 0) {
      notify(
        'warning',
        'Pagu Anggaran Tidak Valid',
        'Nominal pagu anggaran kategori tidak boleh bernilai negatif.'
      )
      return
    }
    try {
      const updated = await financeService.updateCategoryBudget(
        selectedEventId,
        category,
        plannedAmount
      )
      setBudget(updated)
      notify(
        'success',
        'Pagu RAB Diperbarui',
        `Alokasi anggaran berhasil diperbarui menjadi Rp ${plannedAmount.toLocaleString('id-ID')}.`
      )
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Gagal memperbarui pagu anggaran kategori.'
      setErrorMessage(msg)
      notify('error', 'Gagal Memperbarui Pagu', msg)
    }
  }

  const handleVerifySpj = async (id: string, approved: boolean) => {
    if (!selectedEventId) return
    setErrorMessage(null)
    try {
      await financeService.verifySpj(selectedEventId, id, approved)
      notify(
        approved ? 'success' : 'warning',
        approved ? 'Kuitansi SPJ Diverifikasi' : 'Kuitansi SPJ Ditolak',
        approved
          ? 'Bukti pengeluaran telah disetujui dan diverifikasi.'
          : 'Bukti pengeluaran ditolak dan dikembalikan untuk revisi.'
      )
      await loadFinanceData(selectedEventId)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Gagal memverifikasi status kuitansi SPJ.'
      setErrorMessage(msg)
      notify('error', 'Verifikasi SPJ Gagal', msg)
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (eventsLoading) {
    return (
      <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between flex-wrap gap-4 animate-pulse">
          <div className="space-y-2.5">
            <div className="h-5 w-44 bg-[#202020] rounded-full" />
            <div className="h-8 w-72 sm:w-96 bg-[#242424] rounded-lg" />
            <div className="h-4 w-64 sm:w-[440px] bg-[#1c1c1c] rounded" />
          </div>
          <div className="h-10 w-48 bg-[#242424] rounded-full" />
        </div>

        {/* Event Context Selector Bar Skeleton */}
        <div className="p-4 bg-[#151515] border border-[#262626] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242424]" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-[#202020] rounded" />
              <div className="h-4 w-56 bg-[#262626] rounded" />
              <div className="h-3 w-40 bg-[#202020] rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-64 bg-[#242424] rounded-xl" />
            <div className="h-10 w-10 bg-[#242424] rounded-xl" />
          </div>
        </div>

        <FinanceDetailsSkeleton />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-16 text-center p-8 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl max-w-lg mx-auto font-['Montserrat',sans-serif] text-white">
        <Calendar size={36} className="text-[#9C9C9C] mx-auto mb-3" />
        <h3 className="font-bold text-lg text-white mb-2">
          Belum Ada Event untuk Dikelola
        </h3>
        <p className="text-xs text-[#9C9C9C] mb-6 leading-relaxed">
          Anggaran RAB dan pencatatan kuitansi SPJ terhubung langsung dengan setiap event. Silakan buat event terlebih dahulu.
        </p>
        <Link to="/dashboard/events/create" className="no-underline">
          <Button variant="accent" size="md" icon={<Plus size={16} />}>
            Buat Event Pertama
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      <Toast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        position="bottom-right"
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <Badge variant="accent">MANAJEMEN KEUANGAN EVENT</Badge>
            {selectedEvent?.myRole && (
              <Badge variant="dark" className="capitalize">
                Role: {selectedEvent.myRole}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Anggaran RAB & SPJ Kuitansi
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Pelacakan anggaran pos biaya, pencatatan pengeluaran, dan audit verifikasi bukti SPJ spesifik per event.
          </p>
        </div>

        <Button
          variant="accent"
          size="md"
          icon={<Plus size={16} />}
          onClick={handleOpenCreateModal}
          disabled={!selectedEventId}
        >
          Catat Pengeluaran Baru
        </Button>
      </div>

      {/* Event Context Selector Bar */}
      <div className="p-4 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#202020] border border-[#3D3D3D] flex items-center justify-center text-[#CFFE06] shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C9C9C] block">
              Event Aktif Terpilih
            </span>
            <div className="text-sm sm:text-base font-bold text-white truncate">
              {selectedEvent?.title || 'Pilih Event'}
            </div>
            {selectedEvent && (
              <div className="text-xs text-[#9C9C9C] truncate">
                {selectedEvent.organizationName} • {selectedEvent.company}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            aria-label="Pilih Event"
            value={selectedEventId}
            onChange={(e) => handleSelectEvent(e.target.value)}
            className="w-full sm:w-72 py-2.5 px-3.5 rounded-xl bg-[#202020] border border-[#3D3D3D] text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[#CFFE06] cursor-pointer"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadFinanceData(selectedEventId)}
            title="Muat Ulang Data Keuangan"
            className="p-2.5 rounded-xl bg-[#202020] border border-[#3D3D3D] text-[#9C9C9C] hover:text-[#CFFE06] hover:border-[#CFFE06] cursor-pointer transition-colors shrink-0"
          >
            <RefreshCw size={16} className={financeLoading ? 'animate-spin text-[#CFFE06]' : ''} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-[#200010] border border-[#DF00D0] text-[#FF88EC] rounded-xl p-4 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-[#DF00D0]" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFinanceData(selectedEventId)}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {financeLoading || (!budget && !errorMessage) ? (
        <FinanceDetailsSkeleton />
      ) : (
        <>
          {budget && <BudgetSummaryCards budget={budget} />}

          {budget && (
            <BudgetVarianceTracker
              categories={budget.categories}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
            />
          )}

          <ExpenseSpjTable
            expenses={expenses}
            onVerify={handleVerifySpj}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteExpense}
          />
        </>
      )}

      <AddExpenseModal
        key={editingExpense?.id || (isModalOpen ? 'create-open' : 'create-closed')}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExpense(null)
        }}
        onSubmitExpense={handleSubmitExpense}
        editingExpense={editingExpense}
        categories={budget?.categories || []}
      />
    </div>
  )
}
