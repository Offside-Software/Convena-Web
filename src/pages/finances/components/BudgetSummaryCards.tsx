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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--mem-gray-500)',
            textTransform: 'uppercase',
          }}
        >
          Total Pagu Anggaran (RAB)
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0' }}>
          Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)' }}>Alokasi RAB Disetujui</span>
      </div>

      <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: 'var(--mem-pink-light)' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--mem-dark)',
            textTransform: 'uppercase',
          }}
        >
          Realisasi Pengeluaran
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0' }}>
          Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--mem-dark)' }}>
          {usagePercent}% dari total pagu anggaran
        </span>
      </div>

      <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: 'var(--mem-yellow-light)' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--mem-dark)',
            textTransform: 'uppercase',
          }}
        >
          Sisa Saldo Anggaran
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0' }}>
          Rp {budget.remainingBudget.toLocaleString('id-ID')}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--mem-dark)' }}>
          {budget.remainingBudget >= 0 ? 'Aman terkendali' : 'Melebihi Pagu RAB'}
        </span>
      </div>

      <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--mem-gray-500)',
            textTransform: 'uppercase',
          }}
        >
          SPJ Menunggu Verifikasi
        </span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.75rem',
            margin: '4px 0',
            color: 'var(--mem-pink)',
          }}
        >
          {budget.pendingSpjCount} Kuitansi
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)' }}>Perlu dicek Bendahara</span>
      </div>
    </div>
  )
}
