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
              className={`font-['Space_Grotesk',sans-serif] font-bold text-xs py-1.5 px-3.5 rounded-full border-2 border-[#121215] cursor-pointer transition-all ${
                active
                  ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215]'
                  : 'bg-white hover:bg-gray-100 shadow-none'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tabel SPJ */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[#121215] font-['Space_Grotesk',sans-serif] text-[#121215]">
              <th className="py-3 px-2 font-bold">Item Pengeluaran</th>
              <th className="py-3 px-2 font-bold">Divisi</th>
              <th className="py-3 px-2 font-bold">Nominal (Rp)</th>
              <th className="py-3 px-2 font-bold">Status SPJ</th>
              <th className="py-3 px-2 font-bold">Keterangan Kuitansi</th>
              <th className="py-3 px-2 text-right font-bold">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="py-3 px-2 font-bold text-[#121215]">
                  <div>{exp.title}</div>
                  <span className="text-xs text-gray-500 font-normal">
                    {exp.receiptDate} • Oleh: {exp.submittedBy}
                  </span>
                </td>
                <td className="py-3 px-2 text-[#121215]">{exp.division}</td>
                <td className="py-3 px-2 font-mono font-extrabold text-[#121215]">
                  Rp {exp.amount.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-2">
                  <Badge
                    variant={
                      exp.spjStatus === 'verified'
                        ? 'mint'
                        : exp.spjStatus === 'rejected'
                          ? 'coral'
                          : 'yellow'
                    }
                    className="text-[11px]"
                  >
                    {exp.spjStatus === 'verified'
                      ? 'TERVERIFIKASI'
                      : exp.spjStatus === 'rejected'
                        ? 'DITOLAK'
                        : 'MENUNGGU'}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-xs text-gray-600 max-w-[280px]">
                  {exp.notes || '-'}
                </td>
                <td className="py-3 px-2 text-right">
                  {exp.spjStatus === 'submitted' ? (
                    <div className="inline-flex gap-1.5">
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
                    <span className="text-xs text-gray-500 font-semibold">
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
