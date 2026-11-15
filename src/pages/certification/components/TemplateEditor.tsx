import React, { useRef } from 'react'
import {
  Palette,
  Frame,
  Image as ImageIcon,
  FileText,
  QrCode,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  Check,
} from 'lucide-react'
import { Button } from '../../../components/common/Button.tsx'
import { Input } from '../../../components/common/Input.tsx'
import type {
  BorderStyle,
  CertificateCategory,
  CertificateColors,
  CertificateTemplateDesign,
  SignatorySlot,
} from '../../../types/certificate.ts'
import {
  BORDER_STYLE_OPTIONS,
  CERTIFICATE_CATEGORIES,
  COLOR_PALETTES,
  QUICK_SIGNATORY_PRESETS,
  SAMPLE_CAMPUS_CREST_BASE64,
  SAMPLE_CONVENA_LOGO_BASE64,
  SAMPLE_TROPHY_CREST_BASE64,
} from './certificatePresets.ts'

export interface TemplateEditorProps {
  category: CertificateCategory
  onCategoryChange: (cat: CertificateCategory, applyPreset: boolean) => void
  template: CertificateTemplateDesign
  onChange: (updated: CertificateTemplateDesign) => void
  onSaveTemplate?: () => void
  savingTemplate?: boolean
}

const PLACEHOLDER_TOKENS = [
  { token: '{{nama}}', label: 'Nama Penerima' },
  { token: '{{event}}', label: 'Nama Event' },
  { token: '{{peran}}', label: 'Peran / Jabatan' },
  { token: '{{peringkat}}', label: 'Juara / Predikat' },
  { token: '{{tim}}', label: 'Nama Tim' },
  { token: '{{anggota}}', label: 'Daftar Anggota' },
  { token: '{{instansi}}', label: 'Instansi / Kampus' },
  { token: '{{tanggal}}', label: 'Tanggal Terbit' },
  { token: '{{nomor}}', label: 'Nomor Sertifikat' },
]

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  category,
  onCategoryChange,
  template,
  onChange,
  onSaveTemplate,
  savingTemplate = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const updateColors = (partial: Partial<CertificateColors>) => {
    onChange({
      ...template,
      colors: {
        ...template.colors,
        ...partial,
      },
    })
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({
          ...template,
          logoUrl: reader.result,
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAddSignatory = (preset?: {
    title: string
    defaultName: string
    defaultIdNumber: string
  }) => {
    const newSig: SignatorySlot = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: preset?.defaultName || 'Nama Penandatangan',
      title: preset?.title || 'Jabatan Penandatangan',
      idNumber: preset?.defaultIdNumber || '',
    }
    onChange({
      ...template,
      signatories: [...template.signatories, newSig],
    })
  }

  const handleUpdateSignatory = (
    id: string,
    patch: Partial<SignatorySlot>
  ) => {
    onChange({
      ...template,
      signatories: template.signatories.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    })
  }

  const handleRemoveSignatory = (id: string) => {
    if (template.signatories.length <= 1) return
    onChange({
      ...template,
      signatories: template.signatories.filter((s) => s.id !== id),
    })
  }

  const handleMoveSignatory = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= template.signatories.length) return
    const next = [...template.signatories]
    const [item] = next.splice(index, 1)
    next.splice(targetIndex, 0, item)
    onChange({
      ...template,
      signatories: next,
    })
  }

  const handleInsertToken = (token: string) => {
    const spacer =
      template.description.endsWith(' ') || template.description.length === 0
        ? ''
        : ' '
    onChange({
      ...template,
      description: `${template.description}${spacer}${token}`,
    })
  }

  return (
    <div className="space-y-5 font-['Montserrat',sans-serif]">
      {/* 1. KATEGORI VARIASI SERTIFIKAT */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#CFFE06]" />
            <h3 className="text-sm font-bold text-white m-0">
              1. Kategori & Variasi Sertifikat
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onCategoryChange(category, true)}
            className="text-[11px] font-bold text-[#CFFE06] hover:underline cursor-pointer"
          >
            Muat Ulang Preset Kategori Ini
          </button>
        </div>

        <p className="text-xs text-[#9C9C9C] mb-3 leading-relaxed">
          Pilih jenis sertifikat untuk eksperimen desain (Pemenang, Peserta, Kelompok/Tim, Pembicara, atau Panitia). Klik kategori untuk beralih dan menerapkan preset.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CERTIFICATE_CATEGORIES.map((cat) => {
            const active = category === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onCategoryChange(cat.value, true)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#CFFE06]/12 border-[#CFFE06] text-white shadow-[0_0_15px_rgba(207,254,6,0.15)]'
                    : 'bg-[#1D1D1D] border-[#2E2E2E] text-[#CCCCCC] hover:border-[#505050]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      active
                        ? 'bg-[#CFFE06] text-black'
                        : 'bg-[#2A2A2A] text-[#9C9C9C]'
                    }`}
                  >
                    {cat.badge}
                  </span>
                  {active && <Check size={13} className="text-[#CFFE06]" />}
                </div>
                <div className="text-xs font-bold leading-snug">
                  {cat.shortLabel}
                </div>
                <div className="text-[10px] text-[#8E8E8E] line-clamp-2 mt-0.5">
                  {cat.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. WARNA & PALET TEMA */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-[#CFFE06]" />
          <h3 className="text-sm font-bold text-white m-0">
            2. Skema Warna & Palet Tema
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {COLOR_PALETTES.map((preset) => {
            const isSelected =
              template.colors.background.toLowerCase() ===
                preset.colors.background.toLowerCase() &&
              template.colors.primary.toLowerCase() ===
                preset.colors.primary.toLowerCase()

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => updateColors(preset.colors)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#CFFE06] bg-[#222222]'
                    : 'border-[#2E2E2E] bg-[#1B1B1B] hover:border-[#4A4A4A]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    style={{ backgroundColor: preset.colors.background }}
                    className="w-4 h-4 rounded-full border border-white/25"
                  />
                  <span
                    style={{ backgroundColor: preset.colors.primary }}
                    className="w-4 h-4 rounded-full border border-white/25"
                  />
                  <span
                    style={{ backgroundColor: preset.colors.accent }}
                    className="w-4 h-4 rounded-full border border-white/25"
                  />
                  <span
                    style={{ backgroundColor: preset.colors.text }}
                    className="w-4 h-4 rounded-full border border-black/25"
                  />
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-[#9C9C9C] line-clamp-1">
                  {preset.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Fine-grained color pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#2A2A2A]">
          {[
            { key: 'background', label: 'Latar Kanvas' },
            { key: 'surface', label: 'Kotak / Kartu' },
            { key: 'primary', label: 'Warna Utama' },
            { key: 'accent', label: 'Warna Aksen' },
            { key: 'text', label: 'Teks Utama' },
            { key: 'mutedText', label: 'Teks Sekunder' },
          ].map((item) => {
            const colorKey = item.key as keyof CertificateColors
            const currentVal = template.colors[colorKey]
            return (
              <label
                key={item.key}
                className="relative flex items-center gap-2.5 bg-[#1E1E1E] border border-[#333333] rounded-xl px-2.5 py-2 cursor-pointer hover:border-[#CFFE06]/60 transition-colors overflow-hidden min-w-0"
              >
                <span
                  style={{ backgroundColor: currentVal }}
                  className="relative w-7 h-7 rounded-lg border border-white/25 shrink-0 shadow-inner overflow-hidden flex items-center justify-center"
                >
                  <input
                    type="color"
                    value={currentVal}
                    onChange={(e) =>
                      updateColors({ [colorKey]: e.target.value })
                    }
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      padding: 0,
                      margin: 0,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </span>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="text-[10px] font-semibold text-[#9C9C9C] truncate leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-white uppercase truncate leading-tight mt-0.5">
                    {currentVal}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* 3. TIPE BINGKAI (BORDER) & ORIENTASI */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Frame size={16} className="text-[#CFFE06]" />
          <h3 className="text-sm font-bold text-white m-0">
            3. Tipe Bingkai (Border) & Orientasi
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {BORDER_STYLE_OPTIONS.map((opt) => {
            const active = template.borderStyle === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...template,
                    borderStyle: opt.value as BorderStyle,
                  })
                }
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-[#CFFE06]/12 border-[#CFFE06] text-white'
                    : 'bg-[#1D1D1D] border-[#2E2E2E] text-[#CCCCCC] hover:border-[#505050]'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{opt.label}</div>
                <div className="text-[10px] text-[#9C9C9C] leading-snug">
                  {opt.description}
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2A2A2A]">
          <div>
            <label className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">
              Ketebalan Garis Bingkai: <strong className="text-white">{template.borderWidth}px</strong>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={template.borderWidth}
              onChange={(e) =>
                onChange({
                  ...template,
                  borderWidth: Number(e.target.value),
                })
              }
              className="w-full accent-[#CFFE06] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9C9C] mb-1.5">
              Orientasi Kertas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['landscape', 'portrait'] as const).map((ori) => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => onChange({ ...template, orientation: ori })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    template.orientation === ori
                      ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                      : 'bg-[#202020] text-[#CCCCCC] border-[#333333] hover:border-[#555555]'
                  }`}
                >
                  {ori === 'landscape' ? 'Mendatar (Landscape)' : 'Tegak (Portrait)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOGO SERTIFIKAT & QR UTAMA (BASE64) */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon size={16} className="text-[#CFFE06]" />
          <h3 className="text-sm font-bold text-white m-0">
            4. Logo Institusi & Logo di Dalam QR Sertifikat
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Unggah Logo (Base64)
          </Button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...template, logoUrl: SAMPLE_CONVENA_LOGO_BASE64 })
            }
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#202020] border border-[#333333] hover:border-[#CFFE06] text-white cursor-pointer"
          >
            Logo Convena
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...template, logoUrl: SAMPLE_CAMPUS_CREST_BASE64 })
            }
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#202020] border border-[#333333] hover:border-[#CFFE06] text-white cursor-pointer"
          >
            Lambang Kampus
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...template, logoUrl: SAMPLE_TROPHY_CREST_BASE64 })
            }
            className="text-xs px-2.5 py-1.5 rounded-lg bg-[#202020] border border-[#333333] hover:border-[#CFFE06] text-white cursor-pointer"
          >
            Trofi Juara
          </button>
          {template.logoUrl && (
            <button
              type="button"
              onClick={() => onChange({ ...template, logoUrl: undefined })}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#261424] border border-[#DF00D0]/50 text-[#DF00D0] hover:bg-[#DF00D0] hover:text-white cursor-pointer"
            >
              Hapus Logo
            </button>
          )}
        </div>

        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1D1D1D] border border-[#2E2E2E] cursor-pointer">
          <input
            type="checkbox"
            checked={template.embedLogoInQr}
            onChange={(e) =>
              onChange({ ...template, embedLogoInQr: e.target.checked })
            }
            className="mt-0.5 accent-[#CFFE06]"
          />
          <div>
            <div className="text-xs font-bold text-white">
              Sematkan Logo di Tengah Kode QR Validasi Sertifikat Utama
            </div>
            <div className="text-[11px] text-[#9C9C9C] mt-0.5">
              Logo hanya ditampilkan pada QR Validasi Sertifikat Utama. Seluruh QR tanda tangan pejabat/panitia tetap ditampilkan murni tanpa gambar di dalamnya.
            </div>
          </div>
        </label>
      </div>

      {/* 5. JUDUL & DESKRIPSI SERTIFIKAT */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[#CFFE06]" />
          <h3 className="text-sm font-bold text-white m-0">
            5. Judul & Narasi Deskripsi Sertifikat
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teks Lencana Atas (Ribbon)"
            value={template.badgeText || ''}
            onChange={(e) =>
              onChange({ ...template, badgeText: e.target.value })
            }
            placeholder="Contoh: SERTIFIKAT RESMI TERVERIFIKASI"
          />
          <Input
            label="Judul Utama Sertifikat"
            value={template.title}
            onChange={(e) => onChange({ ...template, title: e.target.value })}
            placeholder="Contoh: SERTIFIKAT PENGHARGAAN"
          />
        </div>

        <Input
          label="Subjudul Pengantar Penerima"
          value={template.subtitle}
          onChange={(e) => onChange({ ...template, subtitle: e.target.value })}
          placeholder="Contoh: Diberikan dengan bangga kepada:"
        />

        <div className="mb-3">
          <label className="block font-semibold text-xs tracking-wide text-[#9C9C9C] mb-1.5">
            Deskripsi / Narasi Sertifikat
          </label>
          <textarea
            rows={3}
            value={template.description}
            onChange={(e) =>
              onChange({ ...template, description: e.target.value })
            }
            placeholder="Masukkan narasi sertifikat..."
            className="w-full p-3 rounded-xl bg-[#202020] border border-[#3D3D3D] focus:border-[#CFFE06] outline-none text-xs sm:text-sm text-white leading-relaxed"
          />
          <div className="mt-2">
            <span className="text-[11px] text-[#9C9C9C] mr-2">
              Sisipkan Variabel Otomatis:
            </span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {PLACEHOLDER_TOKENS.map((p) => (
                <button
                  key={p.token}
                  type="button"
                  onClick={() => handleInsertToken(p.token)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#222222] border border-[#383838] text-[#CFFE06] hover:border-[#CFFE06] cursor-pointer"
                  title={`Sisipkan ${p.label}`}
                >
                  {p.token}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-[#2A2A2A]">
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input
              type="checkbox"
              checked={template.showStudentId}
              onChange={(e) =>
                onChange({ ...template, showStudentId: e.target.checked })
              }
              className="accent-[#CFFE06]"
            />
            <span>Tampilkan NIM / ID & Instansi</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input
              type="checkbox"
              checked={template.showGroupMembers}
              onChange={(e) =>
                onChange({ ...template, showGroupMembers: e.target.checked })
              }
              className="accent-[#CFFE06]"
            />
            <span>Tampilkan Daftar Anggota Tim (Untuk Sertifikat Kelompok)</span>
          </label>
        </div>
      </div>

      {/* 6. PENANDATANGAN SERTIFIKAT (SEMUA TANDA TANGAN ADALAH KODE QR TANPA GAMBAR) */}
      <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-[#CFFE06]" />
            <h3 className="text-sm font-bold text-white m-0">
              6. Kustomisasi Penandatangan QR ({template.signatories.length} Pejabat)
            </h3>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => handleAddSignatory()}
          >
            Tambah Penandatangan
          </Button>
        </div>

        <p className="text-xs text-[#9C9C9C] mb-3 leading-relaxed">
          Atur berapa banyak penandatangan di dalam sertifikat (Ketua Pelaksana, Rektor, Dekan, Ketua Himpunan, dll). Seluruh tanda tangan dirender sebagai <strong>Kode QR Otentik Murni tanpa gambar di dalamnya</strong>.
        </p>

        {/* Quick-Add Role Buttons */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_SIGNATORY_PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleAddSignatory(preset)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#202020] border border-[#363636] text-[#CCCCCC] hover:border-[#CFFE06] hover:text-[#CFFE06] cursor-pointer transition-colors"
            >
              + {preset.title}
            </button>
          ))}
        </div>

        {/* Signatories List */}
        <div className="space-y-2.5">
          {template.signatories.map((sig, idx) => (
            <div
              key={sig.id}
              className="p-3 rounded-xl bg-[#1D1D1D] border border-[#303030] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#CFFE06] text-black font-extrabold text-[11px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">
                    Penandatangan #{idx + 1} — {sig.title || 'Jabatan'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#282828] text-[#CFFE06]">
                    QR Murni (Tanpa Gambar)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSignatory(idx, -1)}
                    className="p-1 rounded bg-[#262626] text-[#9C9C9C] hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Geser ke kiri"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === template.signatories.length - 1}
                    onClick={() => handleMoveSignatory(idx, 1)}
                    className="p-1 rounded bg-[#262626] text-[#9C9C9C] hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Geser ke kanan"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={template.signatories.length <= 1}
                    onClick={() => handleRemoveSignatory(sig.id)}
                    className="p-1 rounded bg-[#2A1526] text-[#DF00D0] hover:bg-[#DF00D0] hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Hapus penandatangan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={sig.name}
                    onChange={(e) =>
                      handleUpdateSignatory(sig.id, { name: e.target.value })
                    }
                    placeholder="Contoh: Prof. Dr. Hendra, M.Sc."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333333] focus:border-[#CFFE06] outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
                    Jabatan (Ketua Pelaksana, Rektor, dll)
                  </label>
                  <input
                    type="text"
                    value={sig.title}
                    onChange={(e) =>
                      handleUpdateSignatory(sig.id, { title: e.target.value })
                    }
                    placeholder="Contoh: Rektor / Ketua Pelaksana"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333333] focus:border-[#CFFE06] outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#9C9C9C] mb-1">
                    NIP / NIDN / NIM (Opsional)
                  </label>
                  <input
                    type="text"
                    value={sig.idNumber || ''}
                    onChange={(e) =>
                      handleUpdateSignatory(sig.id, {
                        idNumber: e.target.value,
                      })
                    }
                    placeholder="Contoh: NIP. 19680412..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333333] focus:border-[#CFFE06] outline-none text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {onSaveTemplate && (
          <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex justify-end">
            <Button
              type="button"
              variant="accent"
              size="sm"
              disabled={savingTemplate}
              onClick={onSaveTemplate}
            >
              {savingTemplate
                ? 'Menyimpan Template ke Server...'
                : 'Simpan Template Event'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
