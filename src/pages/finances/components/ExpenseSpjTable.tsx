import React, { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import type { ExpenseRecord, SpjStatus } from '../../../types/finance.ts'

export interface ExpenseSpjTableProps {
  expenses: ExpenseRecord[]
  onVerify: (id: string, approved: boolean) => void
}

export const ExpenseSpjTable: React.FC<ExpenseSpjTableProps> = ({ expenses, onVerify }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SpjStatus>('all')

  const filteredExpenses = expenses.filter(
    (exp) => statusFilter === 'all' || exp.spjStatus === statusFilter
  )

  return (
    <Card headerColor="cyan" headerTitle="Daftar Pengeluaran & Verifikasi Kuitansi SPJ">
      {/* Filter Tab Sederhana */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(
          [
            { id: 'all', label: 'Semua' },
            { id: 'submitted', label: 'Menunggu' },
            { id: 'verified', label: 'Terverifikasi' },
            { id: 'rejected', label: 'Ditolak' },
          ] as const
        ).map((tab) => {
          const active = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: '2px solid var(--mem-dark)',
                backgroundColor: active ? 'var(--mem-yellow)' : '#FFFFFF',
                boxShadow: active ? '2px 2px 0px var(--mem-dark)' : 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tabel SPJ */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--mem-dark)', fontFamily: 'var(--font-display)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Item Pengeluaran</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Divisi</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Nominal (Rp)</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status SPJ</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Keterangan Kuitansi</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--mem-gray-200)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                  <div>{exp.title}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)' }}>
                    {exp.receiptDate} • Oleh: {exp.submittedBy}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{exp.division}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  Rp {exp.amount.toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  <Badge
                    variant={
                      exp.spjStatus === 'verified'
                        ? 'mint'
                        : exp.spjStatus === 'rejected'
                          ? 'coral'
                          : 'yellow'
                    }
                    style={{ fontSize: '0.7rem' }}
                  >
                    {exp.spjStatus === 'verified'
                      ? 'TERVERIFIKASI'
                      : exp.spjStatus === 'rejected'
                        ? 'DITOLAK'
                        : 'MENUNGGU'}
                  </Badge>
                </td>
                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#4B5563', maxWidth: '280px' }}>
                  {exp.notes || '-'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                  {exp.spjStatus === 'submitted' ? (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="mint"
                        size="sm"
                        icon={<CheckCircle size={14} />}
                        onClick={() => onVerify(exp.id, true)}
                      >
                        Setuju
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<XCircle size={14} />}
                        onClick={() => onVerify(exp.id, false)}
                      >
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)', fontWeight: 600 }}>
                      {exp.spjStatus === 'verified' ? 'Sudah Diaudit' : 'Perlu Revisi'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
