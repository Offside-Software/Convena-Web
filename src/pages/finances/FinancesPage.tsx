import React, { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Trash2,
  X,
  CreditCard,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react'
import { financeService } from '../../services/finance.service.ts'
import type { ExpenseRecord, ExpenseCategory } from '../../types/finance.ts'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  venue: 'Sewa Gedung / Venue',
  catering: 'Konsumsi / Katering',
  equipment: 'Peralatan & Sound',
  marketing: 'Publikasi & Cetak',
  speaker_honor: 'Honor Pembicara',
  logistics: 'Logistik & Swag',
  other: 'Operasional Lainnya',
}

export const FinancesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Form states
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('catering')
  const [division, setDivision] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const loadExpenses = async () => {
    const data = await financeService.getExpenses('evt-arkavidia-2026')
    setExpenses(data)
  }

  useEffect(() => {
    let isMounted = true
    financeService.getExpenses('evt-arkavidia-2026').then((data) => {
      if (isMounted) setExpenses(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    await financeService.addExpense({
      title,
      amount: Number(amount),
      category,
      division: division || 'Umum',
      receiptDate: date,
      notes,
    })

    // Reset form
    setTitle('')
    setAmount('')
    setDivision('')
    setNotes('')
    setIsModalOpen(false)
    loadExpenses()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan pengeluaran ini?')) {
      await financeService.deleteExpense(id)
      loadExpenses()
    }
  }

  // Filtered expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory =
      selectedCategory === 'all' || exp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const allTotalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catat Pengeluaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola dan catat riwayat pengeluaran dana kepanitiaan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Catat Pengeluaran Baru
        </button>
      </div>

      {/* Ringkasan Sederhana (Clean Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Pengeluaran
            </span>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">
              Rp {allTotalExpense.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt size={22} />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Jumlah Transaksi
            </span>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">
              {expenses.length} Transaksi Tercatat
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Kontrol Tabel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box dengan Flex Container (Anti-Overlap & Clean Border) */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 border border-gray-300 rounded-lg bg-white shadow-xs focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent flex-1 max-w-sm">
            <Search size={16} className="text-gray-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari uraian atau divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!border-none !shadow-none !p-0 !m-0 !bg-transparent text-sm focus:!outline-none focus:!ring-0 w-full text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="!shadow-none !border !border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:!outline-none focus:!ring-2 focus:!ring-gray-900"
            >
              <option value="all">Semua Kategori</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Pengeluaran */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Uraian Pengeluaran</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Divisi</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <FileSpreadsheet size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada pengeluaran ditemukan</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Klik tombol Catat Pengeluaran Baru untuk menambahkan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-xs font-mono">
                      {exp.receiptDate}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div>{exp.title}</div>
                      {exp.notes && (
                        <div className="text-xs text-gray-400 font-normal mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-xs">
                      {exp.division}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 whitespace-nowrap font-mono">
                      Rp {exp.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50/70 border-t border-gray-200 font-semibold text-gray-900">
                  <td colSpan={4} className="py-3 px-4 text-right text-xs uppercase tracking-wide text-gray-500">
                    Total:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base font-bold text-gray-900">
                    Rp {totalExpense.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengeluaran (Clean Standard Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Catat Pengeluaran Baru</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Isi rincian pengeluaran dana kegiatan yang dilakukan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Nama / Uraian Pengeluaran *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Konsumsi Snack Rapat Koordinasi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Nominal Pengeluaran (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Contoh: 350000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Kategori *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none bg-white focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Divisi Pemohon
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Divisi Acara"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Tanggal Transaksi *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Keterangan / Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nama vendor, toko, atau keterangan transaksi..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm !border !border-gray-300 rounded-lg !shadow-none focus:outline-none focus:!border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
