import React, { useState } from 'react'
import {
  Shield,
  Plus,
  Check,
  Save,
  Trash2,
  Lock,
  RotateCcw,
  Info,
} from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { Modal } from '../../../components/common/Modal.tsx'
import { AddRoleModal } from './AddRoleModal.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { OrgRole, PermissionCategoryGroup } from '../../../types/organization.ts'

interface RolesMatrixTabProps {
  orgId: string
  roles: OrgRole[]
  catalog: PermissionCategoryGroup[]
  canManageRoles: boolean
  onRefresh: () => void
}

export const RolesMatrixTab: React.FC<RolesMatrixTabProps> = ({
  orgId,
  roles,
  catalog,
  canManageRoles,
  onRefresh,
}) => {
  // Local state for role permissions: roleId -> Set of permission keys
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    roles.forEach((r) => {
      map[r.id] = [...r.permissions]
    })
    return map
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<OrgRole | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  // Toggle permission in local state
  const handleToggle = (roleId: string, roleName: string, permKey: string) => {
    if (!canManageRoles) return
    if (roleName === 'owner') return // Owner permissions cannot be revoked

    setRolePermissions((prev) => {
      const current = prev[roleId] || []
      const next = current.includes(permKey)
        ? current.filter((k) => k !== permKey)
        : [...current, permKey]
      return {
        ...prev,
        [roleId]: next,
      }
    })
    setHasChanges(true)
  }

  // Save changes across all modified roles
  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      // Save all roles that have changed
      const updatePromises = roles
        .filter((r) => r.name !== 'owner')
        .map((r) => {
          const currentPerms = rolePermissions[r.id] || []
          return organizationService.updateRole(orgId, r.id, {
            permissions: currentPerms,
          })
        })

      await Promise.all(updatePromises)
      setToast({
        message: 'Matriks izin (Permission Matrix) berhasil disimpan ke basis data!',
        type: 'success',
      })
      setHasChanges(false)
      onRefresh()
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal menyimpan perubahan matriks',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const map: Record<string, string[]> = {}
    roles.forEach((r) => {
      map[r.id] = [...r.permissions]
    })
    setRolePermissions(map)
    setHasChanges(false)
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      setSaving(true)
      await organizationService.deleteRole(orgId, roleToDelete.id)
      setToast({ message: `Role '${roleToDelete.displayName}' berhasil dihapus`, type: 'success' })
      setRoleToDelete(null)
      onRefresh()
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal menghapus role',
        type: 'error',
      })
    } finally {
      setSaving(false)
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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield size={18} className="text-[#CFFE06]" />
            Matriks Hak Akses (Permission Matrix)
          </h2>
          <p className="text-xs text-[#9C9C9C] mt-0.5">
            Atur wewenang setiap peran di organisasi. Centang izin yang diperbolehkan untuk setiap role.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Batal</span>
            </Button>
          )}

          {canManageRoles && (
            <Button
              variant="accent"
              size="sm"
              onClick={handleSaveChanges}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 ${
                hasChanges ? '!bg-[#CFFE06] !text-[#000000] font-bold shadow-[0_0_15px_rgba(207,254,6,0.3)]' : ''
              }`}
            >
              <Save size={15} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Matriks'}</span>
            </Button>
          )}

          {canManageRoles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddRoleOpen(true)}
              className="flex items-center gap-1.5 shrink-0"
            >
              <Plus size={15} />
              <span>Tambah Role</span>
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved changes notice banner */}
      {hasChanges && (
        <div className="p-3 bg-[#CFFE06]/10 border border-[#CFFE06]/40 rounded-xl flex items-center justify-between gap-3 text-xs text-[#CFFE06] animate-pulse">
          <div className="flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <span>
              Anda memiliki perubahan hak akses yang belum disimpan. Klik <strong>Simpan Matriks</strong> untuk menerapkan ke seluruh sistem.
            </span>
          </div>
          <Button
            size="sm"
            variant="accent"
            onClick={handleSaveChanges}
            disabled={saving}
            className="!py-1 !px-3 text-xs shrink-0"
          >
            Simpan Sekarang
          </Button>
        </div>
      )}

      {/* Permission Matrix Table */}
      <Card className="bg-[#151515] border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#262626] bg-[#111111]">
                <th className="py-4 px-5 text-xs font-bold text-white uppercase tracking-wider w-80 sticky left-0 bg-[#111111] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                  Hak Akses / Modul
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="py-4 px-4 text-center min-w-[120px] max-w-[150px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-xs text-white">
                        {role.displayName}
                      </span>
                      <div className="flex items-center gap-1">
                        {role.name === 'owner' ? (
                          <span className="text-[10px] text-[#CFFE06] bg-[#CFFE06]/10 px-1.5 py-0.2 rounded font-mono">
                            Permanen
                          </span>
                        ) : role.isSystem ? (
                          <span className="text-[10px] text-[#9C9C9C] bg-[#222222] px-1.5 py-0.2 rounded font-mono">
                            Bawaan
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                            Kustom
                            {canManageRoles && (
                              <button
                                type="button"
                                onClick={() => setRoleToDelete(role)}
                                className="text-[#FF4D4D] hover:text-white cursor-pointer ml-1"
                                title="Hapus Role Kustom"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1F1F1F] text-xs">
              {catalog.map((group) => (
                <React.Fragment key={group.category}>
                  {/* Category Header Row */}
                  <tr className="bg-[#1A1A1A]/80 font-bold text-[11px] text-[#CFFE06] uppercase tracking-wider">
                    <td
                      colSpan={roles.length + 1}
                      className="py-2.5 px-5 border-y border-[#282828]"
                    >
                      {group.label}
                    </td>
                  </tr>

                  {/* Permission Rows under this category */}
                  {group.permissions.map((perm) => (
                    <tr
                      key={perm.key}
                      className="hover:bg-[#1C1C1C]/60 transition-colors duration-150"
                    >
                      {/* Permission Description Cell */}
                      <td className="py-3 px-5 sticky left-0 bg-[#151515] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                        <div className="font-semibold text-white">
                          {perm.displayName}
                        </div>
                        <div className="text-[11px] text-[#888888] mt-0.5 line-clamp-1">
                          {perm.description}
                        </div>
                      </td>

                      {/* Role Checkbox Cells */}
                      {roles.map((role) => {
                        const isOwner = role.name === 'owner'
                        const isChecked = isOwner
                          ? true
                          : (rolePermissions[role.id] || []).includes(perm.key)

                        return (
                          <td
                            key={role.id}
                            className="py-3 px-4 text-center align-middle"
                          >
                            <button
                              type="button"
                              disabled={isOwner || !canManageRoles}
                              onClick={() => handleToggle(role.id, role.name, perm.key)}
                              className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all duration-150 ${
                                isOwner
                                  ? 'bg-[#CFFE06]/20 text-[#CFFE06] border border-[#CFFE06]/40 cursor-not-allowed'
                                  : isChecked
                                  ? 'bg-[#CFFE06] text-[#000000] shadow-[0_0_8px_rgba(207,254,6,0.3)] cursor-pointer hover:bg-[#bce805]'
                                  : 'bg-[#222222] border border-[#333333] text-transparent hover:border-[#555555] cursor-pointer'
                              }`}
                              title={
                                isOwner
                                  ? 'Owner selalu memiliki semua izin'
                                  : isChecked
                                  ? 'Klik untuk mencabut izin'
                                  : 'Klik untuk memberikan izin'
                              }
                            >
                              {isChecked && <Check size={14} strokeWidth={3} />}
                              {isOwner && <Lock size={11} className="hidden" />}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Role Modal */}
      {isAddRoleOpen && (
        <AddRoleModal
          isOpen={isAddRoleOpen}
          onClose={() => setIsAddRoleOpen(false)}
          orgId={orgId}
          catalog={catalog}
          onSuccess={() => {
            onRefresh()
            setToast({ message: 'Role baru berhasil dibuat!', type: 'success' })
          }}
        />
      )}

      {/* Delete Role Modal */}
      {roleToDelete && (
        <Modal
          isOpen={Boolean(roleToDelete)}
          onClose={() => setRoleToDelete(null)}
          title="Hapus Role Kustom"
          closeOnOverlayClick={false}
        >
          <div className="space-y-4">
            <p className="text-xs text-[#CCCCCC]">
              Apakah Anda yakin ingin menghapus role <strong>{roleToDelete.displayName}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleToDelete(null)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="pink"
                onClick={handleDeleteRole}
                disabled={saving}
                className="bg-[#DF00D0] hover:bg-[#b500a8]"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus Role'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
