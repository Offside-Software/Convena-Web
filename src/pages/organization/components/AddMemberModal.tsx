import React, { useState } from 'react'
import { UserPlus, Mail, Shield, Award } from 'lucide-react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Select } from '../../../components/common/Select.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { OrgRole } from '../../../types/organization.ts'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  orgId: string
  roles: OrgRole[]
  onSuccess: () => void
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  orgId,
  roles,
  onSuccess,
}) => {
  const [identifier, setIdentifier] = useState('')
  // Default to admin or first non-owner role
  const nonOwnerRoles = roles.filter((r) => r.name !== 'owner')
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    nonOwnerRoles[0]?.id || ''
  )
  const [customTitle, setCustomTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  const roleOptions = nonOwnerRoles.map((r) => ({
    label: `${r.displayName} (${r.permissions.length} izin)`,
    value: r.id,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = identifier.trim()
    if (!cleanId) {
      setToast({ message: 'Email atau username anggota wajib diisi', type: 'warning' })
      return
    }

    const roleToAssign = selectedRoleId || nonOwnerRoles[0]?.id
    if (!roleToAssign) {
      setToast({ message: 'Pilih role untuk anggota ini', type: 'warning' })
      return
    }

    try {
      setLoading(true)
      const res = await organizationService.addMember(orgId, {
        identifier: cleanId,
        roleId: roleToAssign,
        customTitle: customTitle.trim() || undefined,
      })

      setToast({ message: res.message || 'Anggota berhasil ditambahkan!', type: 'success' })
      setTimeout(() => {
        setIdentifier('')
        setCustomTitle('')
        onSuccess()
        onClose()
      }, 500)
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal menambahkan anggota. Pastikan email/username terdaftar.',
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
        title="Tambah Anggota Langsung"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#1B1B1B] border border-[#2B2B2B] rounded-xl flex items-start gap-2.5 text-xs text-[#9C9C9C]">
            <UserPlus size={16} className="text-[#CFFE06] shrink-0 mt-0.5" />
            <span>
              Anggota yang ditambahkan akan langsung terdaftar secara aktif di organisasi dan memiliki hak akses sesuai role yang dipilih tanpa perlu menunggu konfirmasi email undangan.
            </span>
          </div>

          <Input
            label="Email atau Username Pengguna *"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Contoh: rina@student.itb.ac.id atau dimas"
            icon={<Mail size={16} />}
            required
            helperText="Pengguna harus sudah terdaftar di sistem Convena"
          />

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5 flex items-center gap-1.5">
              <Shield size={14} className="text-[#CFFE06]" />
              Pilih Role / Peran *
            </label>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              options={roleOptions}
            />
          </div>

          <Input
            label="Jabatan / Divisi Kustom (Opsional)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Contoh: Wakil Ketua / Koordinator Divisi Acara"
            icon={<Award size={16} />}
            helperText="Titel ini akan tampil di profil kepanitiaan organisasi"
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
              disabled={loading || !identifier.trim()}
            >
              {loading ? 'Menambahkan...' : 'Tambah Anggota Sekarang'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
