import React from 'react'
import type { EventBudgetSummary } from '../../../types/finance.ts'

export interface BudgetSummaryCardsProps {
  budget: EventBudgetSummary
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({ budget }) => {
  const usagePercent =
    budget.totalBudgetPlanned > 0
      ? Math.round((budget.totalExpenseRealized / budget.totalBudgetPlanned) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block">
          Total Pagu Anggaran (RAB)
        </span>
        <div className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-[#121215] my-1">
          Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-gray-500">Alokasi RAB Disetujui</span>
      </div>

      <div className="p-5 bg-[#FF94BE] border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
        <span className="text-xs font-mono text-[#121215] uppercase tracking-wider block font-bold">
          Realisasi Pengeluaran
        </span>
        <div className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-[#121215] my-1">
          Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-[#121215] font-semibold">
          {usagePercent}% dari total pagu anggaran
        </span>
      </div>

      <div className="p-5 bg-[#FFF585] border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
        <span className="text-xs font-mono text-[#121215] uppercase tracking-wider block font-bold">
          Sisa Saldo Anggaran
        </span>
        <div className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-[#121215] my-1">
          Rp {budget.remainingBudget.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-[#121215] font-semibold">
          {budget.remainingBudget >= 0 ? 'Aman terkendali' : 'Melebihi Pagu RAB'}
        </span>
      </div>

      <div className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block">
          SPJ Menunggu Verifikasi
        </span>
        <div className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-[#FF4B91] my-1">
          {budget.pendingSpjCount} Kuitansi
        </div>
        <span className="text-xs text-gray-500">Perlu dicek Bendahara</span>
      </div>
    </div>
  )
}
