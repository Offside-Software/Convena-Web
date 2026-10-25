import { mockBudgetSummary, mockExpenses } from '../data/mockData.ts'
import type { EventBudgetSummary, ExpenseRecord, ExpenseCategory } from '../types/finance.ts'

const recalculateTotals = () => {
  const currentTotal = mockBudgetSummary.totalBudgetPlanned || mockBudgetSummary.categories.reduce((sum, c) => sum + c.plannedAmount, 0)
  const totalSpent = mockExpenses
    .filter((e) => e.spjStatus !== 'rejected')
    .reduce((sum, e) => sum + e.amount, 0)

  mockBudgetSummary.totalBudgetPlanned = currentTotal
  mockBudgetSummary.totalExpenseRealized = totalSpent
  mockBudgetSummary.remainingBudget = Math.max(0, currentTotal - totalSpent)
  mockBudgetSummary.pendingSpjCount = mockExpenses.filter((e) => e.spjStatus === 'submitted').length
}

export class FinanceService {
  async getBudgetSummary(_eventId?: string): Promise<EventBudgetSummary> {
    recalculateTotals()
    return Promise.resolve({
      ...mockBudgetSummary,
      categories: mockBudgetSummary.categories.map((c) => ({ ...c })),
    })
  }

  async getExpenses(_eventId?: string): Promise<ExpenseRecord[]> {
    return Promise.resolve([...mockExpenses])
  }

  async updateTotalBudget(
    _eventId: string,
    totalAmount: number
  ): Promise<EventBudgetSummary> {
    mockBudgetSummary.totalBudgetPlanned = Math.max(0, totalAmount)
    recalculateTotals()
    return Promise.resolve({
      ...mockBudgetSummary,
      categories: mockBudgetSummary.categories.map((c) => ({ ...c })),
    })
  }

  async updateCategoryBudget(
    _eventId: string,
    category: ExpenseCategory,
    plannedAmount: number
  ): Promise<EventBudgetSummary> {
    const target = mockBudgetSummary.categories.find((c) => c.category === category)
    if (target) {
      target.plannedAmount = Math.max(0, plannedAmount)
    }
    const sumCategories = mockBudgetSummary.categories.reduce((sum, c) => sum + c.plannedAmount, 0)
    mockBudgetSummary.totalBudgetPlanned = sumCategories
    recalculateTotals()
    return Promise.resolve({
      ...mockBudgetSummary,
      categories: mockBudgetSummary.categories.map((c) => ({ ...c })),
    })
  }

  async addExpense(expenseData: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
    const amount = Number(expenseData.amount) || 0
    const category: ExpenseCategory = expenseData.category || 'other'
    const hasDoc = expenseData.hasDocument ?? Boolean(expenseData.receiptUrl)

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now().toString().slice(-4)}`,
      title: expenseData.title || 'Pengeluaran Kegiatan Ormawa',
      category,
      amount,
      receiptNumber: expenseData.receiptNumber || `KWT-${Math.floor(100 + Math.random() * 900)}`,
      receiptUrl: expenseData.receiptUrl,
      hasDocument: hasDoc,
      receiptDate: expenseData.receiptDate || new Date().toISOString().split('T')[0],
      submittedBy: expenseData.submittedBy || 'Raissa (Panitia Pelaksana)',
      division: expenseData.division || 'Divisi Logistik',
      spjStatus: hasDoc ? 'submitted' : 'draft',
      notes: expenseData.notes || '',
    }

    mockExpenses.unshift(newExp)

    const cat = mockBudgetSummary.categories.find((c) => c.category === category)
    if (cat) {
      cat.spentAmount += amount
    }

    recalculateTotals()
    return Promise.resolve(newExp)
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    const index = mockExpenses.findIndex((e) => e.id === expenseId)
    if (index !== -1) {
      const removed = mockExpenses.splice(index, 1)[0]
      const cat = mockBudgetSummary.categories.find((c) => c.category === removed.category)
      if (cat) {
        cat.spentAmount = Math.max(0, cat.spentAmount - removed.amount)
      }
      recalculateTotals()
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  }

  async uploadReceipt(
    expenseId: string,
    receiptData: { receiptNumber?: string; receiptUrl?: string; notes?: string }
  ): Promise<ExpenseRecord> {
    const exp = mockExpenses.find((e) => e.id === expenseId)
    if (!exp) {
      throw new Error('Data pengeluaran tidak ditemukan')
    }

    exp.hasDocument = true
    if (receiptData.receiptNumber) exp.receiptNumber = receiptData.receiptNumber
    if (receiptData.receiptUrl) exp.receiptUrl = receiptData.receiptUrl
    if (receiptData.notes) exp.notes = receiptData.notes
    exp.spjStatus = 'submitted'

    recalculateTotals()
    return Promise.resolve({ ...exp })
  }

  async verifySpj(expenseId: string, approved: boolean): Promise<ExpenseRecord> {
    const exp = mockExpenses.find((e) => e.id === expenseId)
    if (!exp) {
      throw new Error('Data pengeluaran tidak ditemukan')
    }

    const previousStatus = exp.spjStatus
    exp.spjStatus = approved ? 'verified' : 'rejected'
    if (approved) {
      exp.approvedBy = 'Rina (Bendahara HMIF)'
    } else {
      exp.approvedBy = undefined
    }

    // Adjust category totals if rejected
    const cat = mockBudgetSummary.categories.find((c) => c.category === exp.category)
    if (cat) {
      if (approved && previousStatus === 'rejected') {
        cat.spentAmount += exp.amount
      } else if (!approved && previousStatus !== 'rejected') {
        cat.spentAmount = Math.max(0, cat.spentAmount - exp.amount)
      }
    }

    recalculateTotals()
    return Promise.resolve({ ...exp })
  }
}

export const financeService = new FinanceService()
