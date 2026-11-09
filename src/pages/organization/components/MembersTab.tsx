import React, { useState } from 'react'
import {
  UserPlus,
  Users,
  Shield,
  Award,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '../../../components/common/Card.tsx'
import { Badge } from '../../../components/common/Badge.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { Modal } from '../../../components/common/Modal.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Select } from '../../../components/common/Select.tsx'
import { Toast } from '../../../components/common/Toast.tsx'
import { AddMemberModal } from './AddMemberModal.tsx'
import { organizationService } from '../../../services/organization.service.ts'
import type { OrgMember, OrgRole } from '../../../types/organization.ts'
import { SearchBar } from '../../../components/common/SearchBar.tsx'

interface MembersTabProps {
  orgId: string
  members: OrgMember[]
  roles: OrgRole[]
  canManageMembers: boolean
  onRefresh: () => void
}

export const MembersTab: React.FC<MembersTabProps> = ({
  orgId,
  members,
  roles,
  canManageMembers,
  onRefresh,
}) => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [editCustomTitle, setEditCustomTitle] = useState('')
  const [memberToDelete, setMemberToDelete] = useState<OrgMember | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  const nonOwnerRoles = roles.filter((r) => r.name !== 'owner')

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase()
    const matchesQuery =
      m.displayName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.customTitle && m.customTitle.toLowerCase().includes(q)) ||
      m.roleDisplayName.toLowerCase().includes(q)

    const matchesRole = roleFilter === 'all' || m.roleName === roleFilter
    return matchesQuery && matchesRole
  })

  const openEditModal = (member: OrgMember) => {
    setEditingMember(member)
    setSelectedRoleId(member.roleId)
    setEditCustomTitle(member.customTitle || '')
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    try {
      setActionLoading(true)
      const res = await organizationService.updateMember(orgId, editingMember.id, {
        roleId: selectedRoleId,
        customTitle: editCustomTitle.trim() || undefined,
      })

      setToast({ message: res.message || 'Peran anggota berhasil diperbarui!', type: 'success' })
      setEditingMember(null)
      onRefresh()
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal mengubah peran anggota',
        type: 'error',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToDelete) return

    try {
      setActionLoading(true)
      const res = await organizationService.removeMember(orgId, memberToDelete.id)
      setToast({ message: res.message || 'Anggota berhasil dikeluarkan', type: 'success' })
      setMemberToDelete(null)
      onRefresh()
    } catch (err: any) {
      setToast({
        message: err.message || 'Gagal mengeluarkan anggota',
        type: 'error',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadgeVariant = (roleName: string): 'accent' | 'pink' | 'cyan' | 'mint' | 'outline' => {
    switch (roleName) {
      case 'owner':
        return 'accent'
      case 'admin':
        return 'pink'
      case 'treasurer':
        return 'cyan'
      case 'event_manager':
        return 'mint'
      default:
        return 'outline'
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

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <SearchBar
            placeholder="Cari anggota (nama, email, jabatan)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            showSubmitButton={false}
            clearable
          />

          <div className="shrink-0 sm:w-52">
            <Select
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { label: 'Semua Role', value: 'all' },
                ...roles.map((r) => ({
                  label: r.displayName,
                  value: r.name,
                })),
              ]}
              size="sm"
              variant="surface"
              fullWidth={false}
              className="!mb-0"
            />
          </div>
        </div>

        {canManageMembers && (
          <Button
            variant="accent"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 justify-center shrink-0 self-stretch sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Tambah Anggota Langsung</span>
          </Button>
        )}
      </div>

      {/* Members Table Card */}
      <Card className="bg-[#151515] border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#202020] bg-[#121212]/80 text-[11px] font-bold text-[#9C9C9C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Anggota</th>
                <th className="py-3.5 px-5">Role / Peran</th>
                <th className="py-3.5 px-5">Jabatan / Divisi</th>
                <th className="py-3.5 px-5">Bergabung</th>
                {canManageMembers && <th className="py-3.5 px-5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] text-xs">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManageMembers ? 5 : 4}
                    className="py-12 text-center text-[#9C9C9C]"
                  >
                    <Users size={32} className="mx-auto mb-2 opacity-40 text-[#CFFE06]" />
                    <p className="font-semibold text-white">Tidak ada anggota yang cocok</p>
                    <p className="text-[11px] mt-0.5">
                      {search ? 'Coba ubah kata kunci pencarian' : 'Tambahkan anggota pertama ke organisasi ini'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[#1C1C1C]/60 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#202020] border border-[#3D3D3D] text-[#CFFE06] font-bold flex items-center justify-center shrink-0">
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            <span>{member.displayName}</span>
                            {member.roleName === 'owner' && (
                              <span className="text-[10px] text-[#CFFE06] bg-[#CFFE06]/10 px-1.5 py-0.2 rounded font-mono">
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#9C9C9C] truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge variant={getRoleBadgeVariant(member.roleName)}>
                        {member.roleDisplayName}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-[#CCCCCC]">
                      {member.customTitle || (
                        <span className="text-[#666666] italic">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-[#9C9C9C]">
                      {new Date(member.joinedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {canManageMembers && (
                      <td className="py-3.5 px-5 text-right">
                        {member.roleName !== 'owner' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(member)}
                              className="text-xs hover:text-[#CFFE06]"
                              title="Ubah Role / Jabatan"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToDelete(member)}
                              className="text-xs text-[#9C9C9C] hover:text-[#FF4D4D]"
                              title="Keluarkan dari Organisasi"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#666666] italic">
                            Pemilik
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          orgId={orgId}
          roles={roles}
          onSuccess={onRefresh}
        />
      )}

      {/* Edit Member Role Modal */}
      {editingMember && (
        <Modal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          title={`Ubah Peran: ${editingMember.displayName}`}
          closeOnOverlayClick={false}
        >
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div>
              <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5 flex items-center gap-1.5">
                <Shield size={14} className="text-[#CFFE06]" />
                Pilih Role Baru *
              </label>
              <Select
                value={selectedRoleId}
                onChange={(val) => setSelectedRoleId(val)}
                options={nonOwnerRoles.map((r) => ({
                  label: `${r.displayName} (${r.permissions.length} izin)`,
                  value: r.id,
                }))}
              />
            </div>

            <Input
              label="Jabatan / Divisi Kustom"
              value={editCustomTitle}
              onChange={(e) => setEditCustomTitle(e.target.value)}
              placeholder="Contoh: Koordinator Logistik"
              icon={<Award size={16} />}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMember(null)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={actionLoading}
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <Modal
          isOpen={Boolean(memberToDelete)}
          onClose={() => setMemberToDelete(null)}
          title="Keluarkan Anggota"
          closeOnOverlayClick={false}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#2A1515] border border-[#4A2020] rounded-xl flex items-start gap-3 text-xs text-[#FF8888]">
              <AlertTriangle size={18} className="shrink-0 text-[#FF4D4D] mt-0.5" />
              <span>
                Apakah Anda yakin ingin mengeluarkan <strong>{memberToDelete.displayName}</strong> ({memberToDelete.email}) dari organisasi ini? Akses ke seluruh acara dan keuangan organisasi akan dicabut.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberToDelete(null)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="pink"
                onClick={handleRemoveMember}
                disabled={actionLoading}
                className="bg-[#DF00D0] hover:bg-[#b500a8]"
              >
                {actionLoading ? 'Mengeluarkan...' : 'Ya, Keluarkan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
