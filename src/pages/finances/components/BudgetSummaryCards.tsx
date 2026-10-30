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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-['Montserrat',sans-serif]">
      {/* Pagu RAB */}
      <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl">
        <span className="text-xs text-[#9C9C9C] uppercase tracking-wider block font-semibold">
          Total Pagu Anggaran (RAB)
        </span>
        <div className="font-extrabold text-2xl sm:text-3xl text-white my-1 tracking-tight">
          Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-[#9C9C9C]">Alokasi RAB Disetujui</span>
      </div>

      {/* Realisasi */}
      <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl">
        <span className="text-xs text-[#9C9C9C] uppercase tracking-wider block font-semibold">
          Realisasi Pengeluaran
        </span>
        <div className="font-extrabold text-2xl sm:text-3xl text-[#CFFE06] my-1 tracking-tight">
          Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-[#9C9C9C]">
          {usagePercent}% dari total pagu
        </span>
      </div>

      {/* Sisa Saldo */}
      <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl">
        <span className="text-xs text-[#9C9C9C] uppercase tracking-wider block font-semibold">
          Sisa Saldo Anggaran
        </span>
        <div className="font-extrabold text-2xl sm:text-3xl text-white my-1 tracking-tight">
          Rp {budget.remainingBudget.toLocaleString('id-ID')}
        </div>
        <span className="text-xs text-[#CFFE06] font-semibold">
          {budget.remainingBudget >= 0 ? 'Aman terkendali' : 'Melebihi Pagu RAB'}
        </span>
      </div>

      {/* SPJ Pending */}
      <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl">
        <span className="text-xs text-[#9C9C9C] uppercase tracking-wider block font-semibold">
          SPJ Pending Audit
        </span>
        <div className="font-extrabold text-2xl sm:text-3xl text-[#DF00D0] my-1 tracking-tight">
          {budget.pendingSpjCount} Kuitansi
        </div>
        <span className="text-xs text-[#9C9C9C]">Perlu dicek Bendahara</span>
      </div>
    </div>
  )
}
