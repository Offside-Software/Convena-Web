import React, { useEffect, useState } from 'react'
import { Plus, CheckCircle, XCircle, Download } from 'lucide-react'
import { Card } from '../../components/common/Card.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { Select } from '../../components/common/Select.tsx'
import { financeService } from '../../services/finance.service.ts'
import type { EventBudgetSummary, ExpenseRecord, ExpenseCategory } from '../../types/finance.ts'

export const FinancesPage: React.FC = () => {
  const [budget, setBudget] = useState<EventBudgetSummary | null>(null)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])

  // Expense modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [category, setCategory] = useState<ExpenseCategory>('venue')
  const [division, setDivision] = useState('Divisi Logistik')
  const [notes, setNotes] = useState('')

  const loadData = async () => {
    const [b, exps] = await Promise.all([
      financeService.getBudgetSummary('evt-arkavidia-2026'),
      financeService.getExpenses('evt-arkavidia-2026'),
    ])
    setBudget(b)
    setExpenses(exps)
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([
      financeService.getBudgetSummary('evt-arkavidia-2026'),
      financeService.getExpenses('evt-arkavidia-2026'),
    ]).then(([b, exps]) => {
      if (isMounted) {
        setBudget(b)
        setExpenses(exps)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    await financeService.addExpense({
      title,
      amount: Number(amount),
      category,
      division,
      notes,
    })

    setIsModalOpen(false)
    setTitle('')
    setAmount(0)
    setNotes('')
    loadData()
  }

  const handleVerify = async (id: string, approved: boolean) => {
    await financeService.verifySpj(id, approved)
    loadData()
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Badge variant="mint" tilt="left" style={{ marginBottom: '0.4rem' }}>
            TRANSPARANSI KEUANGAN
          </Badge>
          <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Anggaran, SPJ & LPJ</h1>
          <p style={{ color: 'var(--mem-gray-500)', margin: '4px 0 0' }}>
            Pencatatan pos pengeluaran anggaran dan verifikasi kuitansi Surat Pertanggungjawaban (SPJ).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="yellow" size="md" icon={<Download size={18} />}>
            Ekspor Draf LPJ
          </Button>
          <Button variant="pink" size="md" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Catat Pengeluaran Baru
          </Button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      {budget && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--mem-gray-500)', textTransform: 'uppercase' }}>
              Total Pagu Anggaran
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0' }}>
              Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)' }}>RAB Arkavidia disetujui</span>
          </div>

          <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: 'var(--mem-pink-light)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--mem-dark)', textTransform: 'uppercase' }}>
              Realisasi Pengeluaran
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0', color: 'var(--mem-dark)' }}>
              Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--mem-dark)' }}>
              {Math.round((budget.totalExpenseRealized / budget.totalBudgetPlanned) * 100)}% dari total pagu
            </span>
          </div>

          <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: 'var(--mem-yellow-light)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--mem-dark)', textTransform: 'uppercase' }}>
              Sisa Saldo Kas
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0' }}>
              Rp {budget.remainingBudget.toLocaleString('id-ID')}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--mem-dark)' }}>Aman terkendali</span>
          </div>

          <div className="memphis-box" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--mem-gray-500)', textTransform: 'uppercase' }}>
              SPJ Menunggu Verifikasi
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', margin: '4px 0', color: 'var(--mem-pink)' }}>
              {budget.pendingSpjCount} Kuitansi
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)' }}>Verifikasi oleh Bendahara</span>
          </div>
        </div>
      )}

      {/* Expenses & SPJ Audit Table */}
      <Card headerColor="cyan" headerTitle="Daftar Pengeluaran & Audit Kuitansi SPJ">
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
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--mem-gray-200)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                    <div>{exp.title}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)' }}>{exp.receiptDate}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{exp.division}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                    Rp {exp.amount.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <Badge
                      variant={
                        exp.spjStatus === 'verified' ? 'mint' : exp.spjStatus === 'rejected' ? 'coral' : 'yellow'
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
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <Button
                          variant="mint"
                          size="sm"
                          icon={<CheckCircle size={14} />}
                          onClick={() => handleVerify(exp.id, true)}
                        >
                          Setuju
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<XCircle size={14} />}
                          onClick={() => handleVerify(exp.id, false)}
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Pengeluaran & SPJ Baru"
        headerColor="yellow"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="yellow" size="sm" onClick={handleSubmitExpense}>
              Simpan Kuitansi
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitExpense}>
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
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <Select
              label="Pos Biaya"
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
              Keterangan Nota / Bukti Kuitansi
            </label>
            <textarea
              rows={3}
              placeholder="Nomor invoice, nama vendor percetakan / toko, kelengkapan materai..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
