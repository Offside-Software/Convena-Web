import { apiClient } from './api/client.ts'
import type {
  AddOrgMemberPayload,
  CreateOrganizationPayload,
  CreateRolePayload,
  Organization,
  OrgMember,
  OrgRole,
  PermissionCategoryGroup,
  UpdateOrganizationPayload,
  UpdateOrgMemberPayload,
  UpdateRolePayload,
} from '../types/organization.ts'

export class OrganizationService {
  async getOrganizations(): Promise<Organization[]> {
    try {
      return await apiClient.get<Organization[]>('/organizations')
    } catch {
      return []
    }
  }

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    try {
      return await apiClient.get<Organization>(`/organizations/${id}`)
    } catch {
      return undefined
    }
  }

  async createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
    return await apiClient.post<Organization>('/organizations', payload)
  }

  async updateOrganization(id: string, payload: UpdateOrganizationPayload): Promise<Organization> {
    return await apiClient.patch<Organization>(`/organizations/${id}`, payload)
  }

  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`)
  }

  async getPermissionsCatalog(): Promise<PermissionCategoryGroup[]> {
    try {
      return await apiClient.get<PermissionCategoryGroup[]>('/organizations/permissions/catalog')
    } catch {
      return []
    }
  }

  async getRoles(orgId: string): Promise<OrgRole[]> {
    try {
      return await apiClient.get<OrgRole[]>(`/organizations/${orgId}/roles`)
    } catch {
      return []
    }
  }

  async createRole(orgId: string, payload: CreateRolePayload): Promise<OrgRole> {
    return await apiClient.post<OrgRole>(`/organizations/${orgId}/roles`, payload)
  }

  async updateRole(
    orgId: string,
    roleId: string,
    payload: UpdateRolePayload
  ): Promise<OrgRole> {
    return await apiClient.patch<OrgRole>(`/organizations/${orgId}/roles/${roleId}`, payload)
  }

  async deleteRole(orgId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/roles/${roleId}`)
  }

  async getMembers(orgId: string): Promise<OrgMember[]> {
    try {
      return await apiClient.get<OrgMember[]>(`/organizations/${orgId}/members`)
    } catch {
      return []
    }
  }

  async addMember(
    orgId: string,
    payload: AddOrgMemberPayload
  ): Promise<{ message: string; success: boolean }> {
    return await apiClient.post<{ message: string; success: boolean }>(
      `/organizations/${orgId}/members`,
      payload
    )
  }

  async updateMember(
    orgId: string,
    memberId: string,
    payload: UpdateOrgMemberPayload
  ): Promise<{ message: string; success: boolean }> {
    return await apiClient.patch<{ message: string; success: boolean }>(
      `/organizations/${orgId}/members/${memberId}`,
      payload
    )
  }

  async removeMember(
    orgId: string,
    memberId: string
  ): Promise<{ message: string; success: boolean }> {
    return await apiClient.delete<{ message: string; success: boolean }>(
      `/organizations/${orgId}/members/${memberId}`
    )
  }
}

export const organizationService = new OrganizationService()
