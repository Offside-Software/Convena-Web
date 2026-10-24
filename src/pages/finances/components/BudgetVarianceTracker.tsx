import React, { useState } from 'react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { ProgressBar } from '../../../components/common/ProgressBar.tsx'
import type { BudgetCategoryPlan, ExpenseCategory } from '../../../types/finance.ts'

export interface BudgetVarianceTrackerProps {
  categories: BudgetCategoryPlan[]
  onUpdateCategoryBudget: (category: ExpenseCategory, plannedAmount: number) => Promise<void>
}

export const BudgetVarianceTracker: React.FC<BudgetVarianceTrackerProps> = ({
  categories,
  onUpdateCategoryBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [newAmount, setNewAmount] = useState<number>(0)

  const handleEditClick = (cat: BudgetCategoryPlan) => {
    setEditingCategory(cat.category)
    setNewAmount(cat.plannedAmount)
  }

  const handleSave = async (category: ExpenseCategory) => {
    await onUpdateCategoryBudget(category, newAmount)
    setEditingCategory(null)
  }

  return (
    <Card
      headerColor="yellow"
      headerTitle="Alokasi Anggaran (RAB) per Pos Biaya"
      style={{ marginBottom: '2rem' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const sisa = cat.plannedAmount - cat.spentAmount
          const isOver = sisa < 0
          const isEditing = editingCategory === cat.category

          return (
            <div
              key={cat.category}
              style={{
                border: '2px solid var(--mem-dark)',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: isOver ? '#FFF1F2' : 'var(--mem-bg)',
                boxShadow: '3px 3px 0px var(--mem-dark)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{cat.label}</strong>
                <Badge variant={isOver ? 'coral' : 'mint'} style={{ fontSize: '0.65rem' }}>
                  {isOver ? 'OVER BUDGET' : 'AMAN'}
                </Badge>
              </div>

              <ProgressBar
                value={cat.spentAmount}
                max={cat.plannedAmount || 1}
                color={isOver ? 'pink' : 'cyan'}
                height={10}
              />

              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--mem-gray-500)' }}>Pagu RAB:</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        style={{ width: '110px', padding: '2px 6px', fontSize: '0.75rem' }}
                      />
                      <Button variant="mint" size="sm" onClick={() => handleSave(cat.category)} style={{ padding: '2px 8px' }}>
                        OK
                      </Button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>
                        Rp {cat.plannedAmount.toLocaleString('id-ID')}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        style={{
                          fontSize: '0.7rem',
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Ubah
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--mem-gray-500)' }}>Terpakai:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    Rp {cat.spentAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--mem-gray-500)' }}>Sisa Pos:</span>
                  <strong
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: isOver ? 'var(--mem-pink)' : '#047857',
                    }}
                  >
                    Rp {sisa.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
