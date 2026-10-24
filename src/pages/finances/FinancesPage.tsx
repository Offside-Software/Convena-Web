import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
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

  const loadData = async () => {
    const [b, exps] = await Promise.all([
      financeService.getBudgetSummary('evt-arkavidia-2026'),
      financeService.getExpenses('evt-arkavidia-2026'),
    ])
    setBudget(b)
    setExpenses(exps)
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([
      financeService.getBudgetSummary('evt-arkavidia-2026'),
      financeService.getExpenses('evt-arkavidia-2026'),
    ]).then(([b, exps]) => {
      if (isMounted) {
        setBudget(b)
        setExpenses(exps)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleAddExpense = async (expenseData: Partial<ExpenseRecord>) => {
    await financeService.addExpense(expenseData)
    loadData()
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
    loadData()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-1.5">
            <Badge variant="mint" tilt="left">
              TRANSPARANSI KEUANGAN
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
            Budget, Expense & SPJ Tracking
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Pelacakan anggaran RAB, pencatatan pengeluaran, dan verifikasi kuitansi SPJ.
          </p>
        </div>

        <Button
          variant="pink"
          size="md"
          icon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Catat Pengeluaran Baru
        </Button>
      </div>

      {budget && <BudgetSummaryCards budget={budget} />}

      {budget && (
        <BudgetVarianceTracker
          categories={budget.categories}
          onUpdateCategoryBudget={handleUpdateCategoryBudget}
        />
      )}

      <ExpenseSpjTable expenses={expenses} onVerify={handleVerifySpj} />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitExpense={handleAddExpense}
      />
    </div>
  )
}
