import React, { useState } from 'react'
import {
  Users,
  UserCheck,
  UserPlus,
  Trophy,
  Trash2,
  Eye,
  Sparkles,
  CheckSquare,
  FileSpreadsheet,
  Send,
} from 'lucide-react'
import { Button } from '../../../components/common/Button.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import type { EventRegistration } from '../../../types/event.ts'
import type {
  CertificateCategory,
  CertificateRecipientInput,
} from '../../../types/certificate.ts'
import { CERTIFICATE_CATEGORIES } from './certificatePresets.ts'

export interface RecipientsPanelProps {
  eventTitle: string
  registrations: EventRegistration[]
  registrationsLoading: boolean
  recipients: CertificateRecipientInput[]
  activeRecipientId: string
  onSelectRecipient: (id: string) => void
  onAddRecipients: (items: CertificateRecipientInput[]) => void
  onUpdateRecipient: (
    id: string,
    patch: Partial<CertificateRecipientInput>
  ) => void
  onRemoveRecipient: (id: string) => void
  onClearRecipients: () => void
  onIssueAll: () => void
  issuing: boolean
  defaultCategory: CertificateCategory
}

const RANK_QUICK_CHIPS = [
  'Juara 1 (First Place)',
  'Juara 2 (Second Place)',
  'Juara 3 (Third Place)',
  'Juara Favorit',
  'Best Innovation',
  'Best Speaker',
  'Finalis Terbaik',
]

export const RecipientsPanel: React.FC<RecipientsPanelProps> = ({
  eventTitle,
  registrations,
  registrationsLoading,
  recipients,
  activeRecipientId,
  onSelectRecipient,
  onAddRecipients,
  onUpdateRecipient,
  onRemoveRecipient,
  onClearRecipients,
  onIssueAll,
  issuing,
  defaultCategory,
}) => {
  const [sourceTab, setSourceTab] = useState<'participant' | 'group' | 'custom'>(
    'custom'
  )

  // Participant filter state
  const [onlyCheckedIn, setOnlyCheckedIn] = useState(false)
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([])
  const [participantCategory, setParticipantCategory] =
    useState<CertificateCategory>('attendance')
  const [participantRank, setParticipantRank] = useState('')

  // Group form state
  const [groupName, setGroupName] = useState('')
  const [groupLeader, setGroupLeader] = useState('')
  const [groupMembersText, setGroupMembersText] = useState('')
  const [groupInstitution, setGroupInstitution] = useState('')
  const [groupRank, setGroupRank] = useState('Juara 1 Kategori Tim')
  const [groupRoleLabel, setGroupRoleLabel] = useState('Delegasi Tim Kompetisi')

  // Custom individual / anything form state
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [customStudentId, setCustomStudentId] = useState('')
  const [customInstitution, setCustomInstitution] = useState('')
  const [customCategory, setCustomCategory] =
    useState<CertificateCategory>(defaultCategory)
  const [customRoleLabel, setCustomRoleLabel] = useState('Peserta Aktif')
  const [customRank, setCustomRank] = useState('')

  // Bulk paste state
  const [bulkText, setBulkText] = useState('')
  const [showBulkBox, setShowBulkBox] = useState(false)

  const filteredRegistrations = onlyCheckedIn
    ? registrations.filter((r) => r.status === 'checked_in')
    : registrations

  const toggleSelectReg = (id: string) => {
    setSelectedRegIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllRegistrations = () => {
    if (selectedRegIds.length === filteredRegistrations.length) {
      setSelectedRegIds([])
    } else {
      setSelectedRegIds(filteredRegistrations.map((r) => r.id))
    }
  }

  const handleAddSelectedRegistrations = () => {
    const chosen = filteredRegistrations.filter((r) =>
      selectedRegIds.includes(r.id)
    )
    if (chosen.length === 0) return

    const newItems: CertificateRecipientInput[] = chosen.map((reg) => ({
      id: `rec-part-${reg.id}-${Date.now()}`,
      type: 'participant',
      name: reg.attendeeName,
      email: reg.attendeeEmail,
      institution: reg.attendeeInstitution || undefined,
      category: participantCategory,
      roleLabel:
        participantCategory === 'winner'
          ? 'Pemenang Kompetisi'
          : 'Peserta Kegiatan',
      rank: participantRank.trim() || undefined,
      registrationId: reg.id,
    }))

    onAddRecipients(newItems)
    setSelectedRegIds([])
  }

  const handleAddGroupRecipient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    const members = groupMembersText
      .split(/[\n,;]+/)
      .map((m) => m.trim())
      .filter(Boolean)

    const newGroup: CertificateRecipientInput = {
      id: `rec-grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'group',
      name: groupLeader.trim() || groupName.trim(),
      groupName: groupName.trim(),
      groupMembers: members,
      institution: groupInstitution.trim() || undefined,
      category: 'group',
      roleLabel: groupRoleLabel.trim() || 'Delegasi Tim',
      rank: groupRank.trim() || undefined,
    }

    onAddRecipients([newGroup])
    setGroupName('')
    setGroupLeader('')
    setGroupMembersText('')
  }

  const handleAddCustomRecipient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const newCustom: CertificateRecipientInput = {
      id: `rec-cst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'custom',
      name: customName.trim(),
      email: customEmail.trim() || undefined,
      studentId: customStudentId.trim() || undefined,
      institution: customInstitution.trim() || undefined,
      category: customCategory,
      roleLabel: customRoleLabel.trim() || 'Peserta',
      rank: customRank.trim() || undefined,
    }

    onAddRecipients([newCustom])
    setCustomName('')
    setCustomEmail('')
    setCustomStudentId('')
  }

  const handleAddBulkRecipients = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    const parsed: CertificateRecipientInput[] = lines.map((line, i) => {
      const parts = line.split('|').map((p) => p.trim())
      const [name, catRaw, roleRaw, rankRaw, nimRaw, instRaw] = parts
      const validCats: CertificateCategory[] = [
        'winner',
        'attendance',
        'group',
        'speaker',
        'committee',
        'custom',
      ]
      const cat: CertificateCategory = validCats.includes(
        (catRaw || '').toLowerCase() as CertificateCategory
      )
        ? ((catRaw || '').toLowerCase() as CertificateCategory)
        : customCategory

      return {
        id: `rec-bulk-${Date.now()}-${i}`,
        type: cat === 'group' ? 'group' : 'custom',
        name: name || `Penerima #${i + 1}`,
        groupName: cat === 'group' ? name : undefined,
        category: cat,
        roleLabel: roleRaw || 'Peserta',
        rank: rankRaw || undefined,
        studentId: nimRaw || undefined,
        institution: instRaw || undefined,
      }
    })

    onAddRecipients(parsed)
    setBulkText('')
    setShowBulkBox(false)
  }

  const handleLoadExperimentSamples = () => {
    const samples: CertificateRecipientInput[] = [
      {
        id: `rec-exp-win-${Date.now()}`,
        type: 'custom',
        name: 'Alya Putri Maharani',
        email: 'alya.maharani@students.itb.ac.id',
        studentId: '13522018',
        institution: 'Institut Teknologi Bandung',
        category: 'winner',
        roleLabel: 'Finalis Kompetisi Nasional',
        rank: 'Juara 1 (First Place)',
      },
      {
        id: `rec-exp-grp-${Date.now() + 1}`,
        type: 'group',
        name: 'Bagas Adi Saputra',
        groupName: 'Tim Nusantara AI Lab',
        groupMembers: [
          'Bagas Adi Saputra',
          'Nadia Larasati',
          'Kevin Wijaya',
          'Zahra Aulia',
        ],
        institution: 'Universitas Indonesia',
        category: 'group',
        roleLabel: 'Delegasi Tim Hackathon',
        rank: 'Best Innovation Team',
      },
      {
        id: `rec-exp-att-${Date.now() + 2}`,
        type: 'participant',
        name: 'Dimas Wahyu Nugroho',
        email: 'dimas.wahyu@ugm.ac.id',
        studentId: '22/492811/TK/54122',
        institution: 'Universitas Gadjah Mada',
        category: 'attendance',
        roleLabel: 'Peserta Aktif',
      },
      {
        id: `rec-exp-spk-${Date.now() + 3}`,
        type: 'custom',
        name: 'Dr. Ing. Fajar Sidik, S.T., M.T.',
        email: 'fajar.sidik@telkomuniversity.ac.id',
        institution: 'Telkom University',
        category: 'speaker',
        roleLabel: 'Pembicara Utama (Keynote Speaker)',
      },
    ]
    onAddRecipients(samples)
  }

  return (
    <div className="space-y-5 font-['Montserrat',sans-serif]">
      {/* SOURCE SELECTOR TABS */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Tambah Penerima Sertifikat ({eventTitle})
            </h3>
            <p className="text-xs text-[#9C9C9C] mt-0.5 mb-0">
              Buat sertifikat untuk peserta terdaftar, kelompok/tim, pemenang lomba, pembicara, maupun penerima kustom.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Sparkles size={13} />}
            onClick={handleLoadExperimentSamples}
          >
            Muat Contoh Variasi (Pemenang, Tim, Peserta)
          </Button>
        </div>

        {/* 3 Mode Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSourceTab('custom')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              sourceTab === 'custom'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#1E1E1E] text-[#CCCCCC] border-[#333333] hover:border-[#555555]'
            }`}
          >
            <UserPlus size={15} />
            <span>Individu / Juara / Bebas</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceTab('group')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              sourceTab === 'group'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#1E1E1E] text-[#CCCCCC] border-[#333333] hover:border-[#555555]'
            }`}
          >
            <Users size={15} />
            <span>Kelompok / Tim / Delegasi</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceTab('participant')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              sourceTab === 'participant'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#1E1E1E] text-[#CCCCCC] border-[#333333] hover:border-[#555555]'
            }`}
          >
            <UserCheck size={15} />
            <span>Dari Peserta Event ({registrations.length})</span>
          </button>
        </div>

        {/* TAB 1: CUSTOM / INDIVIDUAL / WINNER / ANYTHING */}
        {sourceTab === 'custom' && (
          <form onSubmit={handleAddCustomRecipient} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Nama Lengkap Penerima *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Alya Putri Maharani"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Kategori Variasi Sertifikat
                </label>
                <select
                  value={customCategory}
                  onChange={(e) =>
                    setCustomCategory(e.target.value as CertificateCategory)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                >
                  {CERTIFICATE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Peran / Status Partisipasi
                </label>
                <input
                  type="text"
                  value={customRoleLabel}
                  onChange={(e) => setCustomRoleLabel(e.target.value)}
                  placeholder="Contoh: Peserta, Pembicara, Panitia Inti"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Predikat Juara / Penghargaan (Opsional)
                </label>
                <input
                  type="text"
                  value={customRank}
                  onChange={(e) => setCustomRank(e.target.value)}
                  placeholder="Contoh: Juara 1 / Best Speaker"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  NIM / Nomor Identitas (Opsional)
                </label>
                <input
                  type="text"
                  value={customStudentId}
                  onChange={(e) => setCustomStudentId(e.target.value)}
                  placeholder="Contoh: 13522018"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Asal Kampus / Instansi (Opsional)
                </label>
                <input
                  type="text"
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  placeholder="Contoh: Institut Teknologi Bandung"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>
            </div>

            {/* Quick Rank Chips */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[10px] text-[#9C9C9C] flex items-center gap-1 mr-1">
                <Trophy size={11} className="text-[#CFFE06]" />
                Pilihan Cepat Predikat:
              </span>
              {RANK_QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setCustomRank(chip)
                    setCustomCategory('winner')
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#222222] border border-[#383838] text-[#CCCCCC] hover:border-[#CFFE06] hover:text-[#CFFE06] cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowBulkBox((prev) => !prev)}
                className="text-xs font-semibold text-[#CFFE06] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span>
                  {showBulkBox
                    ? 'Tutup Impor Massal (CSV / Baris)'
                    : 'Impor Banyak Penerima Sekaligus (Baris Teks / CSV)'}
                </span>
              </button>

              <Button
                type="submit"
                variant="accent"
                size="sm"
                icon={<UserPlus size={14} />}
              >
                Tambah ke Daftar Penerima
              </Button>
            </div>

            {showBulkBox && (
              <div className="p-3 rounded-xl bg-[#1C1C1C] border border-[#333333] space-y-2 mt-2">
                <div className="text-xs font-bold text-white">
                  Tempel Daftar Penerima (1 baris per orang/tim)
                </div>
                <div className="text-[11px] text-[#9C9C9C]">
                  Format: <code>Nama | Kategori (winner/attendance/group/speaker/committee) | Peran | Predikat Juara | NIM | Instansi</code>
                </div>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Budi Hartono | winner | Finalis Lomba | Juara 1 | 13522001 | ITB\nSiti Aminah | attendance | Peserta Seminar | | 18222015 | ITB\nTim Cyber Garuda | group | Delegasi Hackathon | Juara 2 | | UI`}
                  className="w-full p-2.5 rounded-lg bg-[#121212] border border-[#333333] text-xs font-mono text-white outline-none focus:border-[#CFFE06]"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddBulkRecipients}
                  >
                    Tambahkan Semua Baris
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* TAB 2: GROUP / TEAM RECIPIENT */}
        {sourceTab === 'group' && (
          <form onSubmit={handleAddGroupRecipient} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Nama Kelompok / Tim / Delegasi *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Tim Garuda Cyber ITB"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Nama Ketua Tim / Perwakilan (Opsional)
                </label>
                <input
                  type="text"
                  value={groupLeader}
                  onChange={(e) => setGroupLeader(e.target.value)}
                  placeholder="Contoh: Bagas Adi Saputra"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Predikat / Prestasi Kelompok
                </label>
                <input
                  type="text"
                  value={groupRank}
                  onChange={(e) => setGroupRank(e.target.value)}
                  placeholder="Contoh: Juara 1 Hackathon / Delegasi Terbaik"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Asal Kampus / Instansi Tim
                </label>
                <input
                  type="text"
                  value={groupInstitution}
                  onChange={(e) => setGroupInstitution(e.target.value)}
                  placeholder="Contoh: Institut Teknologi Bandung"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Daftar Nama Anggota Tim (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={groupMembersText}
                  onChange={(e) => setGroupMembersText(e.target.value)}
                  placeholder="Contoh: Bagas Adi, Nadia Larasati, Kevin Wijaya"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1">
                  Peran Kelompok
                </label>
                <input
                  type="text"
                  value={groupRoleLabel}
                  onChange={(e) => setGroupRoleLabel(e.target.value)}
                  placeholder="Contoh: Tim Finalis Kompetisi"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="accent"
                size="sm"
                icon={<Users size={14} />}
              >
                Tambah Kelompok ke Daftar
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: EVENT PARTICIPANTS FROM REGISTRATIONS */}
        {sourceTab === 'participant' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyCheckedIn}
                  onChange={(e) => setOnlyCheckedIn(e.target.checked)}
                  className="accent-[#CFFE06]"
                />
                <span>Hanya peserta yang sudah Presensi Kehadiran (Checked-In)</span>
              </label>

              {filteredRegistrations.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllRegistrations}
                  className="text-xs font-semibold text-[#CFFE06] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare size={13} />
                  <span>
                    {selectedRegIds.length === filteredRegistrations.length
                      ? 'Batalkan Semua Pilihan'
                      : `Pilih Semua (${filteredRegistrations.length})`}
                  </span>
                </button>
              )}
            </div>

            {registrationsLoading ? (
              <div className="py-6 text-center text-xs text-[#9C9C9C]">
                Memuat data peserta terdaftar dari event...
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] text-center">
                <p className="text-xs text-[#9C9C9C] m-0">
                  Belum ada peserta terdaftar yang sesuai filter pada event ini. Anda tetap dapat menambahkan peserta melalui tab <strong>Individu / Juara / Bebas</strong> atau <strong>Kelompok / Tim</strong>.
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredRegistrations.map((reg) => {
                    const checked = selectedRegIds.includes(reg.id)
                    return (
                      <label
                        key={reg.id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-[#CFFE06]/10 border-[#CFFE06]'
                            : 'bg-[#1D1D1D] border-[#2E2E2E] hover:border-[#484848]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectReg(reg.id)}
                            className="accent-[#CFFE06]"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">
                              {reg.attendeeName}
                            </div>
                            <div className="text-[11px] text-[#9C9C9C] truncate">
                              {reg.attendeeEmail}{' '}
                              {reg.attendeeInstitution
                                ? `• ${reg.attendeeInstitution}`
                                : ''}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={
                            reg.status === 'checked_in' ? 'accent' : 'dark'
                          }
                        >
                          {reg.status === 'checked_in' ? 'Hadir' : reg.tierName}
                        </Badge>
                      </label>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#2A2A2A] items-end">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
                      Kategori Sertifikat Peserta
                    </label>
                    <select
                      value={participantCategory}
                      onChange={(e) =>
                        setParticipantCategory(
                          e.target.value as CertificateCategory
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#202020] border border-[#3D3D3D] text-xs text-white"
                    >
                      {CERTIFICATE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.shortLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
                      Predikat / Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={participantRank}
                      onChange={(e) => setParticipantRank(e.target.value)}
                      placeholder="Contoh: Peserta Terbaik"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#202020] border border-[#3D3D3D] text-xs text-white"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    disabled={selectedRegIds.length === 0}
                    onClick={handleAddSelectedRegistrations}
                  >
                    Tambahkan ({selectedRegIds.length}) Peserta
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* QUEUED RECIPIENTS LIST (WITH LIVE VARIATION SELECTOR) */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Antrean Penerima & Variasi Sertifikat ({recipients.length})
            </h3>
            <p className="text-xs text-[#9C9C9C] mt-0.5 mb-0">
              Klik pada baris penerima untuk melihat pratinjau langsung sertifikatnya di atas. Setiap penerima dapat memiliki variasi kategori/juara berbeda.
            </p>
          </div>

          {recipients.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearRecipients}
                className="text-xs text-[#DF00D0] hover:underline cursor-pointer"
              >
                Kosongkan Antrean
              </button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                icon={<Send size={13} />}
                disabled={issuing}
                onClick={onIssueAll}
              >
                {issuing
                  ? 'Menerbitkan ke Event...'
                  : `Terbitkan ${recipients.length} Sertifikat`}
              </Button>
            </div>
          )}
        </div>

        {recipients.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#1B1B1B] border border-[#2C2C2C] text-center">
            <p className="text-xs text-[#9C9C9C] mb-3">
              Belum ada penerima di dalam antrean penerbitan. Tambahkan peserta, kelompok, atau klik tombol di bawah untuk bereksperimen.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Sparkles size={14} />}
              onClick={handleLoadExperimentSamples}
            >
              Muat 4 Contoh Penerima Berbeda (Juara, Tim, Peserta, Pembicara)
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {recipients.map((rec, index) => {
              const isSelected = rec.id === activeRecipientId
              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecipient(rec.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 flex-wrap ${
                    isSelected
                      ? 'bg-[#CFFE06]/12 border-[#CFFE06] shadow-[0_0_16px_rgba(207,254,6,0.12)]'
                      : 'bg-[#1D1D1D] border-[#2E2E2E] hover:border-[#4A4A4A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#CFFE06] text-black'
                          : 'bg-[#2A2A2A] text-[#9C9C9C]'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {rec.type === 'group' && rec.groupName
                            ? `${rec.groupName} (Ketua: ${rec.name})`
                            : rec.name}
                        </span>
                        <Badge
                          variant={
                            rec.category === 'winner'
                              ? 'accent'
                              : rec.category === 'group'
                                ? 'purple'
                                : 'dark'
                          }
                        >
                          {rec.category.toUpperCase()}
                        </Badge>
                        {rec.rank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            🏆 {rec.rank}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9C9C9C] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Peran: {rec.roleLabel || 'Peserta'}</span>
                        {rec.studentId && <span>• ID: {rec.studentId}</span>}
                        {rec.institution && <span>• {rec.institution}</span>}
                        {rec.groupMembers && rec.groupMembers.length > 0 && (
                          <span>
                            • {rec.groupMembers.length} Anggota:{' '}
                            {rec.groupMembers.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Inline Category & Rank Switcher */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={rec.category}
                      onChange={(e) =>
                        onUpdateRecipient(rec.id, {
                          category: e.target.value as CertificateCategory,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-[#141414] border border-[#363636] text-[11px] text-white"
                      title="Ubah variasi kategori sertifikat untuk penerima ini"
                    >
                      {CERTIFICATE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.shortLabel}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onSelectRecipient(rec.id)}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                          : 'bg-[#252525] text-white border-[#383838] hover:border-[#CFFE06]'
                      }`}
                      title="Pratinjau di Kanvas"
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveRecipient(rec.id)}
                      className="p-1.5 rounded-lg bg-[#281524] border border-[#DF00D0]/40 text-[#DF00D0] hover:bg-[#DF00D0] hover:text-white cursor-pointer"
                      title="Hapus penerima"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
