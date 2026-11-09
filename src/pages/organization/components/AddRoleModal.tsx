import React, { useState } from 'react'
import { Shield, FileText, CheckSquare, Square } from 'lucide-react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { OrgRole, PermissionCategoryGroup } from '../../../types/organization.ts'

interface AddRoleModalProps {
  isOpen: boolean
  onClose: () => void
  orgId: string
  catalog: PermissionCategoryGroup[]
  onSuccess: (newRole: OrgRole) => void
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  orgId,
  catalog,
  onSuccess,
}) => {
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleCategory = (categoryPerms: string[]) => {
    const allSelected = categoryPerms.every((k) => selectedPermissions.includes(k))
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !categoryPerms.includes(k)))
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...categoryPerms])))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanDisplay = displayName.trim()
    if (!cleanDisplay) {
      setToast({ message: 'Nama tampilan role wajib diisi', type: 'warning' })
      return
    }

    const rawName = cleanDisplay
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    try {
      setLoading(true)
      const newRole = await organizationService.createRole(orgId, {
        name: rawName || `role_${Date.now()}`,
        displayName: cleanDisplay,
        description: description.trim() || undefined,
        permissions: selectedPermissions,
      })

      setToast({ message: 'Role kustom baru berhasil dibuat!', type: 'success' })
      setTimeout(() => {
        setDisplayName('')
        setDescription('')
        setSelectedPermissions([])
        onSuccess(newRole)
        onClose()
      }, 500)
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal membuat role kustom. Coba nama lain.',
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
        title="Tambah Role Baru"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Nama Tampilan Role *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Contoh: Koordinator Hubungan Masyarakat"
            icon={<Shield size={16} />}
            required
            helperText="Nama jabatan yang tampil pada badge anggota"
          />

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Deskripsi Tugas & Tanggung Jawab (Opsional)
            </label>
            <div className="flex items-start w-full bg-[#202020] border border-[#3D3D3D] focus-within:border-[#CFFE06] rounded-xl p-2.5">
              <FileText size={16} className="text-[#9C9C9C] mt-1 mr-2 shrink-0" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan ruang lingkup wewenang role ini..."
                rows={2}
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-[#9C9C9C]/60 resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold text-xs text-white">
                Pilih Hak Akses (Permission Matrix)
              </label>
              <span className="text-[11px] text-[#CFFE06] font-semibold">
                {selectedPermissions.length} izin dipilih
              </span>
            </div>

            <div className="space-y-3.5 border border-[#2B2B2B] bg-[#161616] p-3.5 rounded-xl">
              {catalog.map((group) => {
                const groupPermKeys = group.permissions.map((p) => p.key)
                const allSelected =
                  groupPermKeys.length > 0 &&
                  groupPermKeys.every((k) => selectedPermissions.includes(k))

                return (
                  <div key={group.category} className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#262626]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {group.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(groupPermKeys)}
                        className="text-[11px] text-[#9C9C9C] hover:text-[#CFFE06] cursor-pointer"
                      >
                        {allSelected ? 'Batal Semua' : 'Pilih Semua'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.permissions.map((perm) => {
                        const checked = selectedPermissions.includes(perm.key)
                        return (
                          <div
                            key={perm.key}
                            onClick={() => togglePermission(perm.key)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
                              checked
                                ? 'bg-[#CFFE06]/10 border-[#CFFE06] text-white'
                                : 'bg-[#1F1F1F] border-[#2A2A2A] text-[#9C9C9C] hover:border-[#3D3D3D]'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0 text-[#CFFE06]">
                              {checked ? <CheckSquare size={14} /> : <Square size={14} />}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-white leading-tight">
                                {perm.displayName}
                              </div>
                              <div className="text-[10px] text-[#9C9C9C] mt-0.5 line-clamp-1">
                                {perm.description}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

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
              disabled={loading || !displayName.trim()}
            >
              {loading ? 'Menyimpan...' : 'Simpan Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
