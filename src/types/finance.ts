export type SpjStatus = 'draft' | 'submitted' | 'verified' | 'rejected'
export type ExpenseCategory =
  | 'equipment'
  | 'catering'
  | 'venue'
  | 'marketing'
  | 'speaker_honor'
  | 'logistics'
  | 'other'

export interface ExpenseRecord {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  receiptNumber?: string
  receiptUrl?: string
  hasDocument?: boolean
  receiptDate: string
  submittedBy: string
  division: string
  spjStatus: SpjStatus
  approvedBy?: string
  notes?: string
}

export interface BudgetCategoryPlan {
  category: ExpenseCategory
  label: string
  plannedAmount: number
  spentAmount: number
}

export interface EventBudgetSummary {
  eventId: string
  totalBudgetPlanned: number
  totalIncomeRealized: number
  totalExpenseRealized: number
  remainingBudget: number
  pendingSpjCount: number
  categories: BudgetCategoryPlan[]
}
