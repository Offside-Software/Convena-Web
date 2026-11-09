import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
  const [amountInput, setAmountInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEditClick = (cat: BudgetCategoryPlan) => {
    if (isLoading) return
    setEditingCategory(cat.category)
    setAmountInput(cat.plannedAmount > 0 ? cat.plannedAmount.toLocaleString('id-ID') : '')
  }

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    setAmountInput(digits ? Number(digits).toLocaleString('id-ID') : '')
  }

  const handleSave = async (category: ExpenseCategory) => {
    if (isLoading) return
    const parsedAmount = Number(amountInput.replace(/\D/g, '')) || 0
    try {
      setIsLoading(true)
      await onUpdateCategoryBudget(category, parsedAmount)
      setEditingCategory(null)
    } finally {
      setIsLoading(false)
    }
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
              className={`border rounded-xl p-4 transition-colors ${isOver ? 'border-[#DF00D0]/50 bg-[#1e151d]' : 'border-[#3D3D3D]/60 bg-[#151515]'
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
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={amountInput}
                        disabled={isLoading}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(cat.category)
                          if (e.key === 'Escape' && !isLoading) setEditingCategory(null)
                        }}
                        className="w-32 !py-1.5 !px-2.5 text-xs font-mono bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] focus:outline-none rounded-lg text-white disabled:opacity-50"
                      />
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={isLoading}
                        icon={isLoading ? <Loader2 size={12} className="animate-spin" /> : undefined}
                        onClick={() => handleSave(cat.category)}
                        className="!py-1 !px-2.5 text-xs"
                      >
                        {isLoading ? 'Menyimpan...' : 'OK'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-mono">
                        Rp {cat.plannedAmount.toLocaleString('id-ID')}
                      </strong>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleEditClick(cat)}
                        className="text-[11px] underline bg-transparent border-none cursor-pointer font-semibold text-[#CFFE06] disabled:opacity-40 disabled:cursor-not-allowed"
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
                    className={`font-mono ${isOver ? 'text-[#DF00D0]' : 'text-[#CFFE06]'
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
