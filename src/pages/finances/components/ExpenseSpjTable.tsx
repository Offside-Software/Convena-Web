import React, { useState } from 'react'
import { CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import type { ExpenseRecord, SpjStatus } from '../../../types/finance.ts'

export interface ExpenseSpjTableProps {
  expenses: ExpenseRecord[]
  onVerify: (id: string, approved: boolean) => void
  onEdit: (expense: ExpenseRecord) => void
  onDelete: (id: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  venue: 'Sewa Gedung',
  catering: 'Konsumsi',
  equipment: 'Peralatan & Sound',
  marketing: 'Publikasi & Cetak',
  speaker_honor: 'Honor Pembicara',
  logistics: 'Logistik & Swag',
  other: 'Lain-lain',
}

function formatReceiptDate(dateStr: string): string {
  if (!dateStr) return '-'
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) {
    return dateStr
  }
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const ExpenseSpjTable: React.FC<ExpenseSpjTableProps> = ({
  expenses,
  onVerify,
  onEdit,
  onDelete,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SpjStatus>('all')

  const filteredExpenses = expenses.filter(
    (exp) => statusFilter === 'all' || exp.spjStatus === statusFilter
  )

  return (
    <Card
      headerColor="dark"
      headerTitle="Daftar Pengeluaran & Audit Kuitansi SPJ"
      className="font-['Montserrat',sans-serif]"
    >
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(
          [
            { id: 'all', label: 'Semua' },
            { id: 'submitted', label: 'Menunggu' },
            { id: 'verified', label: 'Diverifikasi' },
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
      {filteredExpenses.length === 0 ? (
        <div className="py-10 text-center bg-[#151515] border border-dashed border-[#3D3D3D] rounded-xl">
          <p className="text-xs text-[#9C9C9C] m-0">
            Belum ada catatan pengeluaran untuk filter ini pada event terpilih.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#3D3D3D] text-[#9C9C9C]">
                <th className="py-3 px-3 font-semibold">Item Pengeluaran</th>
                <th className="py-3 px-3 font-semibold">Pos & Divisi</th>
                <th className="py-3 px-3 font-semibold">Nominal (Rp)</th>
                <th className="py-3 px-3 font-semibold">Status SPJ</th>
                <th className="py-3 px-3 font-semibold">Keterangan Kuitansi</th>
                <th className="py-3 px-3 text-right font-semibold">Aksi & Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-[#202020] hover:bg-[#151515]/60 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-white">
                    <div>{exp.title}</div>
                    <span className="text-[11px] text-[#9C9C9C] font-normal">
                      {formatReceiptDate(exp.receiptDate)} • Oleh: {exp.submittedBy}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#9C9C9C]">
                    <div className="text-white font-semibold text-xs">
                      {CATEGORY_LABELS[exp.category] || exp.category}
                    </div>
                    <div className="text-[11px] text-[#9C9C9C]">{exp.division}</div>
                  </td>
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
                    {exp.approvedBy && exp.spjStatus !== 'submitted' && (
                      <div className="text-[10px] text-[#9C9C9C] mt-1">
                        Oleh: {exp.approvedBy}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-xs text-[#9C9C9C] max-w-[260px]">
                    {exp.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                      {exp.spjStatus === 'submitted' && (
                        <>
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
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onEdit(exp)}
                        title="Edit Pengeluaran"
                        className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#2a2a2a] text-[#9C9C9C] hover:text-[#CFFE06] border border-[#3D3D3D] cursor-pointer transition-colors"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(exp.id)}
                        title="Hapus Pengeluaran"
                        className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#2a1520] text-[#9C9C9C] hover:text-[#DF00D0] border border-[#3D3D3D] cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
