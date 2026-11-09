import React, { useState } from 'react'
import { Building2, Globe, FileText, Image as ImageIcon } from 'lucide-react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { Organization } from '../../../types/organization.ts'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (org: Organization) => void
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setToast({ message: 'Nama organisasi wajib diisi', type: 'warning' })
      return
    }

    try {
      setLoading(true)
      const newOrg = await organizationService.createOrganization({
        name: name.trim(),
        company: company.trim() || undefined,
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
      })

      setName('')
      setCompany('')
      setDescription('')
      setLogoUrl('')
      setBannerUrl('')
      onSuccess(newOrg)
      onClose()
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal membuat organisasi baru. Coba lagi.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          open={Boolean(toast)}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Buat Organisasi Baru"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[#9C9C9C] leading-relaxed">
            Organisasi bertindak sebagai entitas induk untuk menaungi event, anggota kepanitiaan, serta matriks perizinan (RBAC). Anda akan otomatis menjadi <span className="text-[#CFFE06] font-semibold">Owner</span> dari organisasi ini.
          </p>

          <Input
            label="Nama Organisasi *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Himpunan Mahasiswa Informatika ITB"
            icon={<Building2 size={16} />}
            required
          />

          <Input
            label="Institusi / Universitas / Perusahaan"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Contoh: Institut Teknologi Bandung"
            icon={<Globe size={16} />}
          />

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Deskripsi Singkat
            </label>
            <div className="flex items-start w-full bg-[#202020] border border-[#3D3D3D] focus-within:border-[#CFFE06] rounded-xl p-2.5">
              <FileText size={16} className="text-[#9C9C9C] mt-1 mr-2 shrink-0" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fokus kegiatan atau mandat organisasi..."
                rows={3}
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-[#9C9C9C]/60 resize-none"
              />
            </div>
          </div>

          <Input
            label="URL Logo (Opsional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://.../logo.png"
            icon={<ImageIcon size={16} />}
          />

          <Input
            label="URL Banner Sampul (Opsional)"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://.../banner.jpg"
            icon={<ImageIcon size={16} />}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Membuat Organisasi...' : 'Buat Organisasi'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
