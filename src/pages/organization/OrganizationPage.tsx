import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Layers,
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Toast } from '../../components/common/Toast.tsx'
import { organizationService } from '../../services/organization.service.ts'
import { OrganizationOverview } from './components/OrganizationOverview.tsx'
import { MembersTab } from './components/MembersTab.tsx'
import { RolesMatrixTab } from './components/RolesMatrixTab.tsx'
import { CreateOrganizationModal } from './components/CreateOrganizationModal.tsx'
import type {
  Organization,
  OrgMember,
  OrgRole,
  PermissionCategoryGroup,
} from '../../types/organization.ts'

export const OrganizationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [roles, setRoles] = useState<OrgRole[]>([])
  const [members, setMembers] = useState<OrgMember[]>([])
  const [catalog, setCatalog] = useState<PermissionCategoryGroup[]>([])

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles'>('members')
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  // 1. Initial Load: Organizations list & Permission catalog
  useEffect(() => {
    let isMounted = true
    Promise.all([
      organizationService.getOrganizations(),
      organizationService.getPermissionsCatalog(),
    ])
      .then(([orgs, cat]) => {
        if (!isMounted) return
        setOrganizations(orgs)
        setCatalog(cat)

        const queryOrgId = searchParams.get('orgId')
        const matched = orgs.find((o) => o.id === queryOrgId)
        const initialId = matched?.id || orgs[0]?.id || ''
        setSelectedOrgId(initialId)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setToast({ message: err.message || 'Gagal memuat data organisasi', type: 'error' })
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [searchParams])

  // 2. Load Details for selected Organization
  useEffect(() => {
    if (!selectedOrgId) return

    let isMounted = true
    Promise.resolve().then(() => {
      if (isMounted) setDataLoading(true)
    })

    Promise.all([
      organizationService.getOrganizationById(selectedOrgId),
      organizationService.getRoles(selectedOrgId),
      organizationService.getMembers(selectedOrgId),
    ])
      .then(([orgDetail, orgRoles, orgMembers]) => {
        if (!isMounted) return
        setSelectedOrg(orgDetail || null)
        setRoles(orgRoles)
        setMembers(orgMembers)
        setDataLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setToast({ message: err.message || 'Gagal memuat rincian organisasi', type: 'error' })
        setDataLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedOrgId])

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId)
    setSearchParams({ orgId })
  }

  const handleRefreshData = () => {
    if (!selectedOrgId) return
    Promise.all([
      organizationService.getOrganizationById(selectedOrgId),
      organizationService.getRoles(selectedOrgId),
      organizationService.getMembers(selectedOrgId),
    ]).then(([orgDetail, orgRoles, orgMembers]) => {
      if (orgDetail) setSelectedOrg(orgDetail)
      setRoles(orgRoles)
      setMembers(orgMembers)
    })
  }

  const canManageMembers =
    selectedOrg?.myRole === 'owner' ||
    Boolean(selectedOrg?.myPermissions?.includes('org:manage_members'))

  const canManageRoles =
    selectedOrg?.myRole === 'owner' ||
    Boolean(selectedOrg?.myPermissions?.includes('org:manage_roles'))

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-[#202020]">
          <div className="h-8 w-64 bg-[#202020] rounded-xl" />
          <div className="h-10 w-44 bg-[#202020] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#151515] rounded-xl border border-[#262626]" />
          ))}
        </div>
        <div className="h-96 bg-[#151515] rounded-xl border border-[#262626]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif]">
      {toast && (
        <Toast
          open={Boolean(toast)}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header & Organization Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#202020]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#202020] text-[#CFFE06] border border-[#3D3D3D]">
              <Building2 size={20} />
            </span>
            <div className="relative">
              {organizations.length > 0 ? (
                <div className="flex items-center gap-8">
                  <select
                    value={selectedOrgId}
                    onChange={(e) => handleSelectOrg(e.target.value)}
                    className="bg-[#151515] border border-[#3D3D3D] rounded-xl py-1 px-3 text-sm font-bold text-white outline-none focus:border-[#CFFE06] cursor-pointer appearance-none"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id} className="bg-[#151515] text-white">
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <h1 className="text-xl font-bold text-white">Belum Ada Organisasi</h1>
              )}
            </div>
          </div>

          {selectedOrg && (
            <div className="flex items-center gap-2">
              <Badge variant="accent">
                Peran Anda: {selectedOrg.myRoleDisplay || selectedOrg.myRole || 'Member'}
              </Badge>
              {selectedOrg.company && (
                <span className="text-xs text-[#9C9C9C] hidden sm:inline">
                  • {selectedOrg.company}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
            icon={<Plus size={16} />}
          >
            <span>Buat Organisasi Baru</span>
          </Button>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="p-12 text-center bg-[#151515] border border-[#262626] rounded-2xl space-y-4">
          <Building2 size={48} className="mx-auto text-[#CFFE06] opacity-70" />
          <h2 className="text-lg font-bold text-white">Anda belum terdaftar dalam organisasi manapun</h2>
          <p className="text-xs text-[#9C9C9C] max-w-md mx-auto">
            Buat organisasi pertama Anda untuk mengelola tim, hak akses berbasis peran (RBAC), dan menyelenggarakan event kampus/komunitas secara terstruktur.
          </p>
          <Button
            variant="accent"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2"
          >
            Buat Organisasi Pertama
          </Button>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-[#202020] pb-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-[#CFFE06] text-[#000000] font-bold shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'text-[#9C9C9C] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Users size={16} />
              <span>Anggota & Tim ({members.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-[#CFFE06] text-[#000000] font-bold shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'text-[#9C9C9C] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Peran & Matriks Izin ({roles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#CFFE06] text-[#000000] font-bold shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                  : 'text-[#9C9C9C] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Layers size={16} />
              <span>Profil Organisasi</span>
            </button>
          </div>

          {/* Tab Contents */}
          {dataLoading ? (
            <div className="p-8 text-center text-[#9C9C9C] animate-pulse space-y-3">
              <div className="h-6 w-48 bg-[#202020] rounded mx-auto" />
              <div className="h-44 bg-[#151515] rounded-xl border border-[#262626]" />
            </div>
          ) : selectedOrg ? (
            <>
              {activeTab === 'overview' && (
                <OrganizationOverview
                  organization={selectedOrg}
                  onUpdate={(updated) => setSelectedOrg(updated)}
                />
              )}

              {activeTab === 'members' && (
                <MembersTab
                  orgId={selectedOrg.id}
                  members={members}
                  roles={roles}
                  canManageMembers={canManageMembers}
                  onRefresh={handleRefreshData}
                />
              )}

              {activeTab === 'roles' && (
                <RolesMatrixTab
                  key={`${selectedOrg.id}-${roles.map((r) => r.updatedAt).join('-')}`}
                  orgId={selectedOrg.id}
                  roles={roles}
                  catalog={catalog}
                  canManageRoles={canManageRoles}
                  onRefresh={handleRefreshData}
                />
              )}
            </>
          ) : null}
        </>
      )}

      {/* Create Organization Modal */}
      {isCreateModalOpen && (
        <CreateOrganizationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newOrg) => {
            setOrganizations((prev) => [newOrg, ...prev])
            setSelectedOrgId(newOrg.id)
            setSearchParams({ orgId: newOrg.id })
            setToast({
              message: `Organisasi '${newOrg.name}' berhasil dibuat! Anda telah ditetapkan sebagai Owner.`,
              type: 'success',
            })
          }}
        />
      )}
    </div>
  )
}
