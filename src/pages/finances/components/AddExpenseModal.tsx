import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Select } from '../../../components/common/Select.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Toast, type ToastType } from '../../../components/common/Toast.tsx'
import type {
  BudgetCategoryPlan,
  CreateExpenseInput,
  ExpenseCategory,
  ExpenseRecord,
} from '../../../types/finance.ts'

export interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitExpense: (data: CreateExpenseInput) => Promise<void>
  editingExpense?: ExpenseRecord | null
  categories?: BudgetCategoryPlan[]
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmitExpense,
  editingExpense = null,
  categories = [],
}) => {
  const [title, setTitle] = useState(() => editingExpense?.title || '')
  const [amount, setAmount] = useState<string>(() =>
    editingExpense ? String(editingExpense.amount) : ''
  )
  const [category, setCategory] = useState<ExpenseCategory>(
    () => editingExpense?.category || 'venue'
  )
  const [division, setDivision] = useState(
    () => editingExpense?.division || 'Divisi Logistik'
  )
  const [notes, setNotes] = useState(() => editingExpense?.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOverBudget, setConfirmedOverBudget] = useState(false)

  // Toast state inside modal for validation & over-budget warnings
  const [toastState, setToastState] = useState<{
    open: boolean
    type: ToastType
    title: string
    message: string
    withConfirmAction?: boolean
  }>({
    open: false,
    type: 'warning',
    title: '',
    message: '',
    withConfirmAction: false,
  })

  const showToast = (
    type: ToastType,
    toastTitle: string,
    message: string,
    withConfirmAction = false
  ) => {
    setToastState({
      open: true,
      type,
      title: toastTitle,
      message,
      withConfirmAction,
    })
  }

  // Budget calculation for selected category
  const selectedCatPlan = categories.find((c) => c.category === category)
  const previousAmountInSameCategory =
    editingExpense && editingExpense.category === category && editingExpense.spjStatus !== 'rejected'
      ? editingExpense.amount
      : 0
  const baseSpent = selectedCatPlan
    ? Math.max(0, selectedCatPlan.spentAmount - previousAmountInSameCategory)
    : 0
  const plannedAmount = selectedCatPlan?.plannedAmount ?? 0
  const remainingBefore = plannedAmount - baseSpent
  const numericAmount = Number(amount) || 0
  const projectedSpent = baseSpent + numericAmount
  const projectedRemaining = plannedAmount - projectedSpent
  const overageAmount = Math.max(0, projectedSpent - plannedAmount)
  const isOverBudget = selectedCatPlan ? numericAmount > 0 && projectedSpent > plannedAmount : false

  const executeSubmit = async () => {
    if (submitting) return
    try {
      setSubmitting(true)
      setToastState((prev) => ({ ...prev, open: false }))
      await onSubmitExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        division: division.trim() || 'Divisi Kepanitiaan',
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Terjadi kesalahan saat menyimpan data pengeluaran.'
      showToast('error', 'Gagal Menyimpan Kuitansi', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (submitting) return

    if (!title.trim()) {
      showToast(
        'warning',
        'Nama Transaksi Belum Diisi',
        'Mohon lengkapi nama transaksi atau pengeluaran sebelum menyimpan kuitansi.'
      )
      return
    }

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast(
        'warning',
        'Nominal Pengeluaran Tidak Valid',
        'Masukkan nominal pengeluaran (Rp) yang lebih besar dari 0.'
      )
      return
    }

    if (!division.trim()) {
      showToast(
        'warning',
        'Divisi Pemohon Wajib Diisi',
        'Mohon cantumkan nama divisi atau bidang kepanitiaan yang mengajukan pengeluaran.'
      )
      return
    }

    // Check over-budget confirmation requirement
    if (isOverBudget && !confirmedOverBudget) {
      setConfirmedOverBudget(true)
      showToast(
        'warning',
        'Peringatan: Melebihi Pagu RAB (Over Budget)',
        `Nominal Rp ${numericAmount.toLocaleString('id-ID')} melampaui sisa pagu pos "${
          selectedCatPlan?.label || category
        }" sebesar Rp ${overageAmount.toLocaleString(
          'id-ID'
        )}. Klik "Tetap Simpan (Over Budget)" untuk mengonfirmasi pencatatan.`,
        true
      )
      return
    }

    await executeSubmit()
  }

  return (
    <>
      <Toast
        open={toastState.open}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
        type={toastState.type}
        title={toastState.title}
        message={toastState.message}
        position="top-right"
        autoCloseMs={toastState.withConfirmAction ? 9000 : 5000}
        action={
          toastState.withConfirmAction
            ? {
                label: 'Konfirmasi & Simpan',
                onClick: executeSubmit,
                loading: submitting,
                icon: <CheckCircle2 size={12} />,
              }
            : undefined
        }
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        title={
          editingExpense
            ? 'Edit Pengeluaran & Kuitansi SPJ'
            : 'Catat Pengeluaran & Kuitansi SPJ'
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => handleSubmit()}
              disabled={submitting}
            >
              {submitting
                ? 'Menyimpan...'
                : isOverBudget && confirmedOverBudget
                  ? 'Tetap Simpan (Over Budget)'
                  : editingExpense
                    ? 'Simpan Perubahan'
                    : 'Simpan Kuitansi'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4 font-['Montserrat',sans-serif]">
          <Input
            label="Nama Transaksi / Pengeluaran *"
            placeholder="Contoh: Cetak Spanduk Promosi Kampus"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="!mb-0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nominal Pengeluaran (Rp) *"
              type="number"
              placeholder="Contoh: 1500000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setConfirmedOverBudget(false)
              }}
              className="!mb-0"
            />
            <Select
              label="Pos Biaya (RAB) *"
              options={[
                { label: 'Sewa Gedung / Venue', value: 'venue' },
                { label: 'Konsumsi / Catering', value: 'catering' },
                { label: 'Peralatan & Sound', value: 'equipment' },
                { label: 'Marketing & Cetak', value: 'marketing' },
                { label: 'Honor Pembicara', value: 'speaker_honor' },
                { label: 'Logistik & Swag', value: 'logistics' },
                { label: 'Biaya Lain-lain', value: 'other' },
              ]}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ExpenseCategory)
                setConfirmedOverBudget(false)
              }}
              className="!mb-0"
            />
          </div>

          {/* Live Category Budget Status Banner */}
          {selectedCatPlan && (
            <div
              className={`p-3.5 rounded-xl border text-xs transition-colors ${
                isOverBudget
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                  : 'bg-[#1a1a1a] border-[#2e2e2e] text-[#9C9C9C]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  {isOverBudget ? (
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  ) : (
                    <Info size={14} className="text-[#CFFE06] shrink-0" />
                  )}
                  Status Pos: {selectedCatPlan.label}
                </span>
                <span className="font-mono text-[11px] text-[#9C9C9C]">
                  Pagu: Rp {plannedAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Sisa Saldo Saat Ini:</span>
                <strong className="font-mono text-white">
                  Rp {remainingBefore.toLocaleString('id-ID')}
                </strong>
              </div>

              {numericAmount > 0 && (
                <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-[#333333]/80">
                  <span>Sisa Setelah Transaksi Ini:</span>
                  <strong
                    className={`font-mono ${
                      isOverBudget ? 'text-amber-400' : 'text-[#CFFE06]'
                    }`}
                  >
                    Rp {projectedRemaining.toLocaleString('id-ID')}{' '}
                    {isOverBudget && `(Over Rp ${overageAmount.toLocaleString('id-ID')})`}
                  </strong>
                </div>
              )}

              {isOverBudget && confirmedOverBudget && (
                <p className="m-0 mt-2 text-[11px] text-amber-300 font-semibold">
                  Konfirmasi diperlukan: Klik tombol &ldquo;Tetap Simpan (Over Budget)&rdquo; di bawah untuk melanjutkan.
                </p>
              )}
            </div>
          )}

          <Input
            label="Divisi Pemohon *"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="!mb-0"
          />

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Keterangan Kuitansi / Bukti Pembayaran
            </label>
            <textarea
              rows={3}
              placeholder="Nomor nota kuitansi, nama toko/rekanan penyedia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-[#1c1c1c] border border-[#333333] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#CFFE06] transition-all"
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
