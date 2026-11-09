import React, { useState } from 'react'
import {
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  Globe,
  FileText,
  Edit3,
} from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { Organization } from '../../../types/organization.ts'

interface OrganizationOverviewProps {
  organization: Organization
  onUpdate: (updated: Organization) => void
}

export const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  organization,
  onUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(organization.name)
  const [editCompany, setEditCompany] = useState(organization.company || '')
  const [editDescription, setEditDescription] = useState(organization.description || '')
  const [editLogoUrl, setEditLogoUrl] = useState(organization.logoUrl || '')
  const [editBannerUrl, setEditBannerUrl] = useState(organization.bannerUrl || '')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  const canEdit =
    organization.myRole === 'owner' ||
    Boolean(organization.myPermissions?.includes('org:edit'))

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      setToast({ message: 'Nama organisasi wajib diisi', type: 'warning' })
      return
    }

    try {
      setLoading(true)
      const res = await organizationService.updateOrganization(organization.id, {
        name: editName.trim(),
        company: editCompany.trim() || undefined,
        description: editDescription.trim() || undefined,
        logoUrl: editLogoUrl.trim() || undefined,
        bannerUrl: editBannerUrl.trim() || undefined,
      })

      onUpdate({
        ...organization,
        ...res,
      })
      setToast({ message: 'Profil organisasi berhasil diperbarui!', type: 'success' })
      setIsEditModalOpen(false)
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal memperbarui profil organisasi',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          open={Boolean(toast)}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Profile Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#262626] bg-[#121212]">
        {organization.bannerUrl ? (
          <img
            src={organization.bannerUrl}
            alt={organization.name}
            className="w-full h-44 object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-44 bg-gradient-to-r from-[#181818] via-[#202020] to-[#141414] opacity-80" />
        )}

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent">
          <div className="flex items-end gap-4">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#CFFE06] bg-[#1A1A1A] shadow-xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#CFFE06] bg-[#1A1A1A] text-[#CFFE06] font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-xl shrink-0">
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {organization.name}
                </h1>
                <Badge variant="accent">{organization.myRoleDisplay || 'Anggota'}</Badge>
              </div>

              {organization.company && (
                <div className="flex items-center gap-1.5 text-xs text-[#9C9C9C]">
                  <Globe size={14} className="text-[#CFFE06]" />
                  <span>{organization.company}</span>
                </div>
              )}
            </div>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 self-stretch sm:self-auto justify-center"
            >
              <Edit3 size={14} />
              <span>Edit Profil Organisasi</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#151515] border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9C9C9C]">Total Anggota</span>
            <span className="p-2 rounded-xl bg-[#202020] text-[#CFFE06]">
              <Users size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {organization.memberCount ?? 1}
          </div>
          <p className="text-[11px] text-[#9C9C9C] mt-1">
            Pengurus dan panitia aktif
          </p>
        </Card>

        <Card className="p-5 bg-[#151515] border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9C9C9C]">Acara Dikelola</span>
            <span className="p-2 rounded-xl bg-[#202020] text-[#00E5FF]">
              <Calendar size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {organization.eventCount ?? 0}
          </div>
          <p className="text-[11px] text-[#9C9C9C] mt-1">
            Event resmi di bawah organisasi
          </p>
        </Card>

        <Card className="p-5 bg-[#151515] border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9C9C9C]">Peran & Matriks</span>
            <span className="p-2 rounded-xl bg-[#202020] text-[#FFD000]">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            5 Default + Kustom
          </div>
          <p className="text-[11px] text-[#9C9C9C] mt-1">
            Tersinkronisasi dengan RBAC
          </p>
        </Card>

        <Card className="p-5 bg-[#151515] border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#9C9C9C]">Hak Akses Anda</span>
            <span className="p-2 rounded-xl bg-[#202020] text-[#DF00D0]">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#CFFE06] tracking-tight">
            {organization.myRole === 'owner' ? 'Akses Penuh' : `${organization.myPermissions?.length || 0} Izin`}
          </div>
          <p className="text-[11px] text-[#9C9C9C] mt-1">
            Status: <span className="text-white font-medium capitalize">{organization.myRole || 'Member'}</span>
          </p>
        </Card>
      </div>

      {/* Description & Metadata Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-[#151515] border-[#262626] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-[#202020]">
            <FileText size={16} className="text-[#CFFE06]" />
            <span>Tentang Organisasi</span>
          </div>
          <p className="text-sm text-[#CCCCCC] leading-relaxed whitespace-pre-line">
            {organization.description ||
              'Belum ada deskripsi untuk organisasi ini. Tambahkan deskripsi agar anggota kepanitiaan memahami profil dan mandat organisasi.'}
          </p>
        </Card>

        <Card className="p-6 bg-[#151515] border-[#262626] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-[#202020]">
            <Building2 size={16} className="text-[#CFFE06]" />
            <span>Informasi Sistem</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#9C9C9C] block mb-0.5">Slug URL:</span>
              <code className="text-[#CFFE06] bg-[#202020] px-2 py-0.5 rounded font-mono">
                {organization.slug}
              </code>
            </div>
            <div>
              <span className="text-[#9C9C9C] block mb-0.5">Tanggal Terdaftar:</span>
              <span className="text-white font-medium">
                {new Date(organization.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-[#9C9C9C] block mb-0.5">ID Organisasi:</span>
              <span className="text-[#9C9C9C] font-mono text-[11px] break-all">
                {organization.id}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Organization Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profil Organisasi"
          closeOnOverlayClick={false}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Nama Organisasi *"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Institusi / Universitas / Perusahaan"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
            />
            <div>
              <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
                Deskripsi
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#202020] border border-[#3D3D3D] rounded-xl p-3 text-sm text-white placeholder:text-[#9C9C9C]/60 outline-none focus:border-[#CFFE06] resize-none"
              />
            </div>
            <Input
              label="URL Logo"
              value={editLogoUrl}
              onChange={(e) => setEditLogoUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="URL Banner"
              value={editBannerUrl}
              onChange={(e) => setEditBannerUrl(e.target.value)}
              placeholder="https://..."
            />
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" variant="accent" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
