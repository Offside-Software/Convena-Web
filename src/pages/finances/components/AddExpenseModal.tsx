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
      title="Catat Pengeluaran & SPJ Baru"
      headerColor="yellow"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button variant="yellow" size="sm" onClick={handleSubmit}>
            Simpan Kuitansi
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nama Transaksi / Pengeluaran"
          placeholder="Contoh: Cetak Spanduk Promosi Kampus"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Nominal Pengeluaran (Rp)"
            type="number"
            placeholder="Contoh: 1500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
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
          />
        </div>

        <Input
          label="Divisi Pemohon"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          required
        />

        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.875rem',
              marginBottom: '0.35rem',
            }}
          >
            Keterangan Nota / Bukti Kuitansi SPJ
          </label>
          <textarea
            rows={3}
            placeholder="Nomor nota, nama toko/vendor, dan kelengkapan materai..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  )
}
