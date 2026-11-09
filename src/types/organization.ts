export interface Division {
  id: string
  name: string
  leadName?: string
  memberCount: number
}

export interface Organization {
  id: string
  name: string
  slug: string
  company?: string | null
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  memberCount?: number
  eventCount?: number
  myRole?: string | null
  myRoleDisplay?: string | null
  myPermissions?: string[]
}

export interface OrgRole {
  id: string
  organizationId: string
  name: string
  displayName: string
  description?: string | null
  isSystem: boolean
  permissions: string[]
  createdAt: string
  updatedAt: string
  memberCount?: number
}

export interface OrgMember {
  id: string
  organizationId: string
  userId: string
  displayName: string
  username: string
  email: string
  company?: string | null
  roleId: string
  roleName: string
  roleDisplayName: string
  customTitle?: string | null
  status: 'active' | 'suspended'
  joinedAt: string
  updatedAt: string
}

export interface PermissionItem {
  key: string
  category: string
  displayName: string
  description: string
}

export interface PermissionCategoryGroup {
  category: string
  label: string
  permissions: PermissionItem[]
}

export interface CreateOrganizationPayload {
  name: string
  slug?: string
  company?: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
}

export interface UpdateOrganizationPayload {
  name?: string
  company?: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
}

export interface CreateRolePayload {
  name: string
  displayName: string
  description?: string
  permissions: string[]
}

export interface UpdateRolePayload {
  displayName?: string
  description?: string
  permissions?: string[]
}

export interface AddOrgMemberPayload {
  identifier: string // email or username
  roleId: string
  customTitle?: string
}

export interface UpdateOrgMemberPayload {
  roleId: string
  customTitle?: string
}
