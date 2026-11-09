import { apiClient } from './api/client.ts'
import type { Organization } from '../types/organization.ts'

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
}

export const organizationService = new OrganizationService()
