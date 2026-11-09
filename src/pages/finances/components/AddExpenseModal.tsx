import React, { useState } from 'react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Select } from '../../../components/common/Select.tsx'
import { Button } from '../../../components/common/Button.tsx'
import type { ExpenseCategory, ExpenseRecord } from '../../../types/finance.ts'

export interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitExpense: (data: Partial<ExpenseRecord>) => Promise<void>
}

interface FormErrors {
  title?: string
  amount?: string
  division?: string
  notes?: string
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmitExpense,
}) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [category, setCategory] = useState<ExpenseCategory>('venue')
  const [division, setDivision] = useState('Divisi Logistik')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const trimmedTitle = title.trim()
    const numericAmount = Number(amount)
    const trimmedDivision = division.trim()

    if (!trimmedTitle) {
      newErrors.title = 'Nama transaksi wajib diisi'
    } else if (trimmedTitle.length < 4) {
      newErrors.title = 'Nama transaksi minimal 4 karakter'
    }

    if (!amount.trim()) {
      newErrors.amount = 'Nominal pengeluaran wajib diisi'
    } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Nominal harus lebih besar dari Rp 0'
    }

    if (!trimmedDivision) {
      newErrors.division = 'Divisi pemohon wajib diisi'
    }

    if (notes.trim().length > 0 && notes.trim().length < 5) {
      newErrors.notes = 'Keterangan kuitansi minimal 5 karakter jika diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetAndClose = () => {
    setErrors({})
    onClose()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmitExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        division: division.trim(),
        notes: notes.trim(),
      })

      setTitle('')
      setAmount('')
      setNotes('')
      setErrors({})
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Catat Pengeluaran & Kuitansi SPJ"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={resetAndClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Kuitansi'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulir pencatatan pengeluaran SPJ"
        className="space-y-4 font-['Montserrat',sans-serif]"
      >
        <Input
          id="expense-title"
          label="Nama Transaksi / Pengeluaran *"
          placeholder="Contoh: Cetak Spanduk Promosi Kampus"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
          }}
          error={errors.title}
          aria-invalid={Boolean(errors.title)}
          required
          className="!mb-0"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="expense-amount"
            label="Nominal Pengeluaran (Rp) *"
            type="number"
            min={1}
            placeholder="Contoh: 1500000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
            }}
            error={errors.amount}
            aria-invalid={Boolean(errors.amount)}
            required
            className="!mb-0"
          />
          <Select
            id="expense-category"
            label="Pos Biaya (RAB)"
            options={[
              { label: 'Sewa Gedung / Venue', value: 'venue' },
              { label: 'Konsumsi / Catering', value: 'catering' },
              { label: 'Peralatan & Sound', value: 'equipment' },
              { label: 'Marketing & Cetak', value: 'marketing' },
              { label: 'Honor Pembicara', value: 'speaker_honor' },
              { label: 'Logistik & Swag', value: 'logistics' },
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="!mb-0"
          />
        </div>

        <Input
          id="expense-division"
          label="Divisi Pemohon *"
          placeholder="Contoh: Divisi Logistik"
          value={division}
          onChange={(e) => {
            setDivision(e.target.value)
            if (errors.division) setErrors((prev) => ({ ...prev, division: undefined }))
          }}
          error={errors.division}
          aria-invalid={Boolean(errors.division)}
          required
          className="!mb-0"
        />

        <div>
          <label
            htmlFor="expense-notes"
            className="block font-semibold text-xs text-[#9C9C9C] mb-1.5"
          >
            Keterangan Kuitansi / Bukti Pembayaran
          </label>
          <textarea
            id="expense-notes"
            rows={3}
            placeholder="Nomor nota kuitansi, nama toko/rekanan penyedia..."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }))
            }}
            aria-invalid={Boolean(errors.notes)}
            className={`w-full p-3 bg-[#1c1c1c] border rounded-xl text-xs font-medium text-white focus:outline-none transition-all ${
              errors.notes
                ? 'border-[#DF00D0] focus:border-[#DF00D0]'
                : 'border-[#333333] focus:border-[#CFFE06]'
            }`}
          />
          {errors.notes && (
            <span role="alert" className="block text-[#DF00D0] text-xs font-medium mt-1.5">
              {errors.notes}
            </span>
          )}
        </div>
      </form>
    </Modal>
  )
}
