import { apiClient } from './api/client.ts'
import { mockBudgetSummary, mockExpenses } from '../data/mockData.ts'
import type { EventBudgetSummary, ExpenseRecord } from '../types/finance.ts'

export class FinanceService {
  async getBudgetSummary(eventId: string): Promise<EventBudgetSummary> {
    try {
      return await apiClient.get<EventBudgetSummary>(`/finances/summary/${eventId}`)
    } catch {
      return mockBudgetSummary
    }
  }

  async getExpenses(eventId: string): Promise<ExpenseRecord[]> {
    try {
      return await apiClient.get<ExpenseRecord[]>(`/finances/expenses/${eventId}`)
    } catch {
      return mockExpenses
    }
  }

  async addExpense(expenseData: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    try {
      return await apiClient.post<ExpenseRecord>('/finances/expenses', expenseData)
    } catch {
      const newExp: ExpenseRecord = {
        id: `exp-${Date.now()}`,
        title: expenseData.title || 'Untitled Expense',
        category: expenseData.category || 'other',
        amount: expenseData.amount || 0,
        receiptDate: expenseData.receiptDate || new Date().toISOString().split('T')[0],
        submittedBy: expenseData.submittedBy || 'Panitia Pelaksana',
        division: expenseData.division || 'Divisi Operasional',
        spjStatus: 'submitted',
        notes: expenseData.notes,
      }
      mockExpenses.unshift(newExp)
      mockBudgetSummary.totalExpenseRealized += newExp.amount
      mockBudgetSummary.remainingBudget -= newExp.amount
      mockBudgetSummary.pendingSpjCount += 1
      return newExp
    }
  }

  async verifySpj(expenseId: string, approved: boolean): Promise<ExpenseRecord> {
    try {
      return await apiClient.patch<ExpenseRecord>(`/finances/expenses/${expenseId}/verify`, { approved })
    } catch {
      const exp = mockExpenses.find((e) => e.id === expenseId)
      if (exp) {
        exp.spjStatus = approved ? 'verified' : 'rejected'
        if (mockBudgetSummary.pendingSpjCount > 0) {
          mockBudgetSummary.pendingSpjCount -= 1
        }
        return { ...exp }
      }
      throw new Error('Expense record not found')
    }
  }
}

export const financeService = new FinanceService()
