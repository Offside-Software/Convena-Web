import { apiClient } from './api/client.ts'
import type {
  EventBudgetSummary,
  ExpenseRecord,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../types/finance.ts'

export class FinanceService {
  async getBudgetSummary(eventId: string): Promise<EventBudgetSummary> {
    return await apiClient.get<EventBudgetSummary>(`/finances/summary/${eventId}`)
  }

  async getExpenses(eventId: string): Promise<ExpenseRecord[]> {
    return await apiClient.get<ExpenseRecord[]>(`/finances/expenses/${eventId}`)
  }

  async updateCategoryBudget(
    eventId: string,
    category: ExpenseCategory,
    plannedAmount: number
  ): Promise<EventBudgetSummary> {
    return await apiClient.patch<EventBudgetSummary>(`/finances/summary/${eventId}/category`, {
      category,
      plannedAmount,
    })
  }

  async addExpense(eventId: string, expenseData: CreateExpenseInput): Promise<ExpenseRecord> {
    return await apiClient.post<ExpenseRecord>(`/finances/expenses/${eventId}`, {
      ...expenseData,
      eventId,
    })
  }

  async updateExpense(
    eventId: string,
    expenseId: string,
    expenseData: UpdateExpenseInput
  ): Promise<ExpenseRecord> {
    return await apiClient.patch<ExpenseRecord>(
      `/finances/expenses/${eventId}/${expenseId}`,
      expenseData
    )
  }

  async deleteExpense(eventId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/finances/expenses/${eventId}/${expenseId}`)
  }

  async verifySpj(
    eventId: string,
    expenseId: string,
    approved: boolean,
    notes?: string
  ): Promise<ExpenseRecord> {
    return await apiClient.patch<ExpenseRecord>(
      `/finances/expenses/${eventId}/${expenseId}/verify`,
      { approved, notes }
    )
  }
}

export const financeService = new FinanceService()
