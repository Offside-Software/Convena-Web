import React, { useEffect, useState } from 'react'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { financeService } from '../../services/finance.service.ts'
import type {
  EventBudgetSummary,
  ExpenseRecord,
  ExpenseCategory,
} from '../../types/finance.ts'
import { BudgetSummaryCards } from './components/BudgetSummaryCards.tsx'
import { BudgetVarianceTracker } from './components/BudgetVarianceTracker.tsx'
import { ExpenseSpjTable } from './components/ExpenseSpjTable.tsx'
import { AddExpenseModal } from './components/AddExpenseModal.tsx'

export const FinancesPage: React.FC = () => {
  const [budget, setBudget] = useState<EventBudgetSummary | null>(null)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [b, exps] = await Promise.all([
        financeService.getBudgetSummary('evt-arkavidia-2026'),
        financeService.getExpenses('evt-arkavidia-2026'),
      ])
      setBudget(b)
      setExpenses(exps)
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Gagal memuat data anggaran dan kuitansi SPJ.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)
    Promise.all([
      financeService.getBudgetSummary('evt-arkavidia-2026'),
      financeService.getExpenses('evt-arkavidia-2026'),
    ])
      .then(([b, exps]) => {
        if (isMounted) {
          setBudget(b)
          setExpenses(exps)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'Gagal memuat data anggaran dan kuitansi SPJ.'
          )
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleAddExpense = async (expenseData: Partial<ExpenseRecord>) => {
    await financeService.addExpense(expenseData)
    await loadData()
  }

  const handleUpdateCategoryBudget = async (
    category: ExpenseCategory,
    plannedAmount: number
  ) => {
    const updated = await financeService.updateCategoryBudget(
      'evt-arkavidia-2026',
      category,
      plannedAmount
    )
    setBudget(updated)
  }

  const handleVerifySpj = async (id: string, approved: boolean) => {
    await financeService.verifySpj(id, approved)
    await loadData()
  }

  return (
    <main
      aria-labelledby="finance-page-title"
      className="font-['Montserrat',sans-serif] bg-[#000000] text-white"
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            id="finance-page-title"
            className="!text-2xl sm:!text-3xl font-extrabold text-white tracking-tight m-0"
          >
            Anggaran RAB & SPJ Kuitansi
          </h1>
          <div className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Pelacakan anggaran pos biaya, pencatatan pengeluaran, dan audit verifikasi bukti SPJ.
          </div>
        </div>

        <Button
          variant="accent"
          size="md"
          icon={<Plus size={16} aria-hidden="true" />}
          onClick={() => setIsModalOpen(true)}
          aria-label="Buka formulir catat pengeluaran baru"
        >
          Catat Pengeluaran Baru
        </Button>
      </header>

      {/* Error State UI */}
      {errorMessage && (
        <section
          role="alert"
          aria-live="assertive"
          className="mb-8 p-5 bg-[#1e151d] border border-[#DF00D0]/60 rounded-xl flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[#DF00D0] shrink-0" size={20} aria-hidden="true" />
            <div>
              <strong className="text-sm font-bold text-white block">
                Gagal Memuat Data Keuangan
              </strong>
              <span className="text-xs text-[#9C9C9C]">{errorMessage}</span>
            </div>
          </div>
          <Button
            variant="accent"
            size="sm"
            icon={<RefreshCw size={14} aria-hidden="true" />}
            onClick={loadData}
          >
            Coba Lagi
          </Button>
        </section>
      )}

      {/* Loading Skeleton State UI */}
      {isLoading && !budget ? (
        <section
          role="status"
          aria-busy="true"
          aria-label="Memuat data anggaran dan SPJ"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl animate-pulse"
            >
              <div className="h-3 w-28 bg-[#262626] rounded mb-3" />
              <div className="h-7 w-40 bg-[#262626] rounded mb-2" />
              <div className="h-3 w-24 bg-[#262626] rounded" />
            </div>
          ))}
        </section>
      ) : (
        <>
          {budget && <BudgetSummaryCards budget={budget} />}

          {budget && (
            <BudgetVarianceTracker
              categories={budget.categories}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
            />
          )}

          <ExpenseSpjTable expenses={expenses} onVerify={handleVerifySpj} />
        </>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitExpense={handleAddExpense}
      />
    </main>
  )
}
