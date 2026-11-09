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
  eventId: string
  title: string
  category: ExpenseCategory
  amount: number
  receiptUrl?: string | null
  receiptDate: string
  submittedById?: string | null
  submittedBy: string
  division: string
  spjStatus: SpjStatus
  approvedById?: string | null
  approvedBy?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateExpenseInput {
  title: string
  category: ExpenseCategory
  amount: number
  receiptUrl?: string
  receiptDate?: string
  division?: string
  submittedBy?: string
  notes?: string
}

export interface UpdateExpenseInput {
  title?: string
  category?: ExpenseCategory
  amount?: number
  receiptUrl?: string
  receiptDate?: string
  division?: string
  notes?: string
}

export interface BudgetCategoryPlan {
  id?: string
  eventId?: string
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
