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
      headerColor="dark"
      headerTitle="Alokasi Anggaran (RAB) per Pos Biaya"
      className="mb-8 font-['Montserrat',sans-serif]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const sisa = cat.plannedAmount - cat.spentAmount
          const isOver = sisa < 0
          const isEditing = editingCategory === cat.category

          return (
            <div
              key={cat.category}
              className={`border rounded-xl p-4 transition-colors ${
                isOver ? 'border-[#DF00D0]/50 bg-[#1e151d]' : 'border-[#3D3D3D]/60 bg-[#151515]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <strong className="text-sm font-bold text-white">{cat.label}</strong>
                <Badge variant={isOver ? 'pink' : 'accent'} className="text-[10px]">
                  {isOver ? 'OVER BUDGET' : 'AMAN'}
                </Badge>
              </div>

              <ProgressBar
                value={cat.spentAmount}
                max={cat.plannedAmount || 1}
                color={isOver ? 'pink' : 'accent'}
                height={8}
                showPercentage={false}
              />

              <div className="text-xs mt-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#9C9C9C]">Pagu RAB:</span>
                  {isEditing ? (
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        className="w-28 py-1 px-2 text-xs bg-[#202020] border border-[#3D3D3D] rounded-lg text-white"
                      />
                      <Button variant="accent" size="sm" onClick={() => handleSave(cat.category)} className="!py-1 !px-2.5 text-xs">
                        OK
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-mono">
                        Rp {cat.plannedAmount.toLocaleString('id-ID')}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="text-[11px] underline bg-transparent border-none cursor-pointer font-semibold text-[#CFFE06]"
                      >
                        Ubah
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-[#9C9C9C]">Terpakai:</span>
                  <strong className="text-white font-mono">
                    Rp {cat.spentAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <div className="flex justify-between pt-1 border-t border-[#3D3D3D]/40">
                  <span className="text-[#9C9C9C]">Sisa Saldo:</span>
                  <strong
                    className={`font-mono ${
                      isOver ? 'text-[#DF00D0]' : 'text-[#CFFE06]'
                    }`}
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
