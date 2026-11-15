import React, { useState } from 'react'
import { CheckCircle, XCircle, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import type { ExpenseRecord, SpjStatus } from '../../../types/finance.ts'

export interface ExpenseSpjTableProps {
  expenses: ExpenseRecord[]
  onVerify: (id: string, approved: boolean) => Promise<void> | void
  onEdit: (expense: ExpenseRecord) => void
  onDelete: (id: string) => Promise<void> | void
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
  const [processingState, setProcessingState] = useState<{
    id: string
    action: 'approve' | 'reject' | 'delete'
  } | null>(null)

  const handleVerifyClick = async (id: string, approved: boolean) => {
    if (processingState) return
    try {
      setProcessingState({ id, action: approved ? 'approve' : 'reject' })
      await onVerify(id, approved)
    } finally {
      setProcessingState(null)
    }
  }

  const handleDeleteClick = async (id: string) => {
    if (processingState) return
    try {
      setProcessingState({ id, action: 'delete' })
      await onDelete(id)
    } finally {
      setProcessingState(null)
    }
  }

  const filteredExpenses = expenses.filter(
    (exp) => statusFilter === 'all' || exp.spjStatus === statusFilter
  )

  return (
    <Card
      compact
      headerColor="dark"
      headerTitle="Daftar Pengeluaran & Audit Kuitansi SPJ"
      className="font-['Montserrat',sans-serif]"
    >
      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-2.5">
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
              className={`font-semibold text-[11px] py-1 px-2.5 rounded-full cursor-pointer transition-all ${
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
        <div className="py-6 text-center bg-[#151515] border border-dashed border-[#3D3D3D] rounded-xl">
          <p className="!text-xs !text-[#9C9C9C] m-0">
            Belum ada catatan pengeluaran untuk filter ini pada event terpilih.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#3D3D3D] text-[#9C9C9C]">
                <th className="py-2 px-2.5 font-semibold text-[11px]">Item Pengeluaran</th>
                <th className="py-2 px-2.5 font-semibold text-[11px]">Pos & Divisi</th>
                <th className="py-2 px-2.5 font-semibold text-[11px]">Nominal (Rp)</th>
                <th className="py-2 px-2.5 font-semibold text-[11px]">Status SPJ</th>
                <th className="py-2 px-2.5 font-semibold text-[11px]">Keterangan Kuitansi</th>
                <th className="py-2 px-2.5 text-right font-semibold text-[11px]">Aksi & Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-[#202020] hover:bg-[#151515]/60 transition-colors"
                >
                  <td className="py-2 px-2.5 font-bold text-white">
                    <div className="text-xs">{exp.title}</div>
                    <span className="text-[10px] text-[#9C9C9C] font-normal">
                      {formatReceiptDate(exp.receiptDate)} • Oleh: {exp.submittedBy}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-[#9C9C9C]">
                    <div className="text-white font-semibold text-[11px]">
                      {CATEGORY_LABELS[exp.category] || exp.category}
                    </div>
                    <div className="text-[10px] text-[#9C9C9C]">{exp.division}</div>
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-white text-xs">
                    Rp {exp.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-2.5">
                    <Badge
                      variant={
                        exp.spjStatus === 'verified'
                          ? 'accent'
                          : exp.spjStatus === 'rejected'
                            ? 'pink'
                            : 'grey'
                      }
                      className="text-[10px] py-0 px-1.5"
                    >
                      {exp.spjStatus === 'verified'
                        ? 'TERVERIFIKASI'
                        : exp.spjStatus === 'rejected'
                          ? 'DITOLAK'
                          : 'MENUNGGU'}
                    </Badge>
                    {exp.approvedBy && exp.spjStatus !== 'submitted' && (
                      <div className="text-[10px] text-[#9C9C9C] mt-0.5">
                        Oleh: {exp.approvedBy}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-[#9C9C9C] max-w-[240px] truncate">
                    {exp.notes || '-'}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {(() => {
                      const isRowBusy = processingState?.id === exp.id
                      const isApproving = isRowBusy && processingState?.action === 'approve'
                      const isRejecting = isRowBusy && processingState?.action === 'reject'
                      const isDeleting = isRowBusy && processingState?.action === 'delete'

                      return (
                        <div className="inline-flex items-center justify-end gap-1 flex-wrap">
                          {exp.spjStatus === 'submitted' && (
                            <>
                              <Button
                                variant="accent"
                                size="sm"
                                disabled={isRowBusy}
                                className="!py-0.5 !px-2 !text-[11px]"
                                icon={
                                  isApproving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={12} />
                                  )
                                }
                                onClick={() => handleVerifyClick(exp.id, true)}
                              >
                                {isApproving ? 'Menyimpan...' : 'Setuju'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isRowBusy}
                                className="!py-0.5 !px-2 !text-[11px]"
                                icon={
                                  isRejecting ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <XCircle size={12} />
                                  )
                                }
                                onClick={() => handleVerifyClick(exp.id, false)}
                              >
                                {isRejecting ? 'Menyimpan...' : 'Tolak'}
                              </Button>
                            </>
                          )}

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => onEdit(exp)}
                            title="Edit Pengeluaran"
                            className="p-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[#9C9C9C] hover:text-[#CFFE06] border border-[#3D3D3D] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Pencil size={12} />
                          </button>

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => handleDeleteClick(exp.id)}
                            title="Hapus Pengeluaran"
                            className="p-1 rounded-md bg-[#202020] hover:bg-[#2a1520] text-[#9C9C9C] hover:text-[#DF00D0] border border-[#3D3D3D] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? (
                              <Loader2 size={12} className="animate-spin text-[#DF00D0]" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        </div>
                      )
                    })()}
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
