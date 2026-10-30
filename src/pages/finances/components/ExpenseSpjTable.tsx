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
    <Card headerColor="dark" headerTitle="Daftar Pengeluaran & Audit Kuitansi SPJ" className="font-['Montserrat',sans-serif]">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
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
              className={`font-semibold text-xs py-1.5 px-3.5 rounded-full cursor-pointer transition-all ${
                active
                  ? 'bg-[#CFFE06] text-black shadow-[0_0_10px_rgba(207,254,6,0.2)]'
                  : 'bg-[#151515] text-[#9C9C9C] hover:text-white border border-[#3D3D3D]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tabel SPJ */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#3D3D3D] text-[#9C9C9C]">
              <th className="py-3 px-3 font-semibold">Item Pengeluaran</th>
              <th className="py-3 px-3 font-semibold">Divisi</th>
              <th className="py-3 px-3 font-semibold">Nominal (Rp)</th>
              <th className="py-3 px-3 font-semibold">Status SPJ</th>
              <th className="py-3 px-3 font-semibold">Keterangan Kuitansi</th>
              <th className="py-3 px-3 text-right font-semibold">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} className="border-b border-[#202020] hover:bg-[#151515]/60 transition-colors">
                <td className="py-3 px-3 font-bold text-white">
                  <div>{exp.title}</div>
                  <span className="text-[11px] text-[#9C9C9C] font-normal">
                    {exp.receiptDate} • Oleh: {exp.submittedBy}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#9C9C9C]">{exp.division}</td>
                <td className="py-3 px-3 font-mono font-bold text-white">
                  Rp {exp.amount.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3">
                  <Badge
                    variant={
                      exp.spjStatus === 'verified'
                        ? 'accent'
                        : exp.spjStatus === 'rejected'
                          ? 'pink'
                          : 'grey'
                    }
                    className="text-[10px]"
                  >
                    {exp.spjStatus === 'verified'
                      ? 'TERVERIFIKASI'
                      : exp.spjStatus === 'rejected'
                        ? 'DITOLAK'
                        : 'MENUNGGU'}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-xs text-[#9C9C9C] max-w-[260px]">
                  {exp.notes || '-'}
                </td>
                <td className="py-3 px-3 text-right">
                  {exp.spjStatus === 'submitted' ? (
                    <div className="inline-flex gap-1.5">
                      <Button
                        variant="accent"
                        size="sm"
                        icon={<CheckCircle size={13} />}
                        onClick={() => onVerify(exp.id, true)}
                      >
                        Setuju
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<XCircle size={13} />}
                        onClick={() => onVerify(exp.id, false)}
                      >
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9C9C9C]">
                      {exp.spjStatus === 'verified' ? '✓ Sudah Diaudit' : 'Perlu Revisi'}
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
