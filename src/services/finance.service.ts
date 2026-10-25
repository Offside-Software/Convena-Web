import { apiClient } from './api/client.ts'
import { mockBudgetSummary, mockExpenses } from '../data/mockData.ts'
import type { EventBudgetSummary, ExpenseRecord, ExpenseCategory } from '../types/finance.ts'

const recalculateTotals = () => {
  const totalPlanned = mockBudgetSummary.categories.reduce((sum, c) => sum + c.plannedAmount, 0)
  const totalSpent = mockExpenses
    .filter((e) => e.spjStatus !== 'rejected')
    .reduce((sum, e) => sum + e.amount, 0)

  mockBudgetSummary.totalBudgetPlanned = totalPlanned
  mockBudgetSummary.totalExpenseRealized = totalSpent
  mockBudgetSummary.remainingBudget = totalPlanned - totalSpent
  mockBudgetSummary.pendingSpjCount = mockExpenses.filter((e) => e.spjStatus === 'submitted').length
}

export class FinanceService {
  async getBudgetSummary(eventId: string): Promise<EventBudgetSummary> {
    try {
      return await apiClient.get<EventBudgetSummary>(`/finances/summary/${eventId}`)
    } catch {
      recalculateTotals()
      return {
        ...mockBudgetSummary,
        categories: mockBudgetSummary.categories.map((c) => ({ ...c })),
      }
    }
  }

  async getExpenses(eventId: string): Promise<ExpenseRecord[]> {
    try {
      return await apiClient.get<ExpenseRecord[]>(`/finances/expenses/${eventId}`)
    } catch {
      return [...mockExpenses]
    }
  }

  async updateCategoryBudget(
    eventId: string,
    category: ExpenseCategory,
    plannedAmount: number
  ): Promise<EventBudgetSummary> {
    try {
      return await apiClient.patch<EventBudgetSummary>(`/finances/summary/${eventId}/category`, {
        category,
        plannedAmount,
      })
    } catch {
      const target = mockBudgetSummary.categories.find((c) => c.category === category)
      if (target) {
        target.plannedAmount = Math.max(0, plannedAmount)
      }
      recalculateTotals()
      return {
        ...mockBudgetSummary,
        categories: mockBudgetSummary.categories.map((c) => ({ ...c })),
      }
    }
  }

  async addExpense(expenseData: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    try {
      return await apiClient.post<ExpenseRecord>('/finances/expenses', expenseData)
    } catch {
      const amount = Number(expenseData.amount) || 0
      const category: ExpenseCategory = expenseData.category || 'other'

      const newExp: ExpenseRecord = {
        id: `exp-${Date.now().toString().slice(-4)}`,
        title: expenseData.title || 'Pengeluaran Kegiatan',
        category,
        amount,
        receiptDate: new Date().toISOString().split('T')[0],
        submittedBy: expenseData.submittedBy || 'Raissa (Panitia)',
        division: expenseData.division || 'Divisi Logistik',
        spjStatus: 'submitted',
        notes: expenseData.notes,
      }

      mockExpenses.unshift(newExp)

      const cat = mockBudgetSummary.categories.find((c) => c.category === category)
      if (cat) {
        cat.spentAmount += amount
      }

      recalculateTotals()
      return newExp
    }
  }

  async verifySpj(expenseId: string, approved: boolean): Promise<ExpenseRecord> {
    try {
      return await apiClient.patch<ExpenseRecord>(`/finances/expenses/${expenseId}/verify`, { approved })
    } catch {
      const exp = mockExpenses.find((e) => e.id === expenseId)
      if (!exp) {
        throw new Error('Data pengeluaran tidak ditemukan')
      }

      exp.spjStatus = approved ? 'verified' : 'rejected'

      if (!approved) {
        const cat = mockBudgetSummary.categories.find((c) => c.category === exp.category)
        if (cat) {
          cat.spentAmount = Math.max(0, cat.spentAmount - exp.amount)
        }
      }

      recalculateTotals()
      return { ...exp }
    }
  }
}

export const financeService = new FinanceService()
