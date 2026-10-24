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
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const sisa = cat.plannedAmount - cat.spentAmount
          const isOver = sisa < 0
          const isEditing = editingCategory === cat.category

          return (
            <div
              key={cat.category}
              className={`border-2 border-[#121215] rounded-xl p-4 shadow-[3px_3px_0px_0px_#121215] ${
                isOver ? 'bg-pink-50' : 'bg-[#FAF9F6]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <strong className="font-['Space_Grotesk',sans-serif] text-sm text-[#121215]">{cat.label}</strong>
                <Badge variant={isOver ? 'coral' : 'mint'} className="text-[10px]">
                  {isOver ? 'OVER BUDGET' : 'AMAN'}
                </Badge>
              </div>

              <ProgressBar
                value={cat.spentAmount}
                max={cat.plannedAmount || 1}
                color={isOver ? 'pink' : 'cyan'}
                height={10}
              />

              <div className="text-xs mt-2 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Pagu RAB:</span>
                  {isEditing ? (
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        className="w-28 py-0.5 px-1.5 text-xs border border-[#121215] rounded"
                      />
                      <Button variant="mint" size="sm" onClick={() => handleSave(cat.category)} className="!py-0.5 !px-2">
                        OK
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <strong className="font-mono text-[#121215]">
                        Rp {cat.plannedAmount.toLocaleString('id-ID')}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="text-[11px] underline bg-transparent border-none cursor-pointer font-bold text-gray-700 hover:text-[#121215]"
                      >
                        Ubah
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Terpakai:</span>
                  <strong className="font-mono text-[#121215]">
                    Rp {cat.spentAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Sisa Pos:</span>
                  <strong
                    className={`font-mono ${isOver ? 'text-[#FF4B91]' : 'text-emerald-700'}`}
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
