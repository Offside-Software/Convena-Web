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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    await onSubmitExpense({
      title,
      amount: Number(amount),
      category,
      division,
      notes,
    })

    setTitle('')
    setAmount('')
    setNotes('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Pengeluaran & Kuitansi SPJ"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="accent" size="sm" onClick={handleSubmit}>
            Simpan Kuitansi
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Montserrat',sans-serif]">
        <Input
          label="Nama Transaksi / Pengeluaran"
          placeholder="Contoh: Cetak Spanduk Promosi Kampus"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="!mb-0"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nominal Pengeluaran (Rp)"
            type="number"
            placeholder="Contoh: 1500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="!mb-0"
          />
          <Select
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
          label="Divisi Pemohon"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          required
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
  )
}
