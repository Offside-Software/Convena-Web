import { apiClient } from './api/client.ts'
import { mockOrganizations } from '../data/mockData.ts'
import type { Organization } from '../types/organization.ts'

export class OrganizationService {
  async getOrganizations(): Promise<Organization[]> {
    try {
      return await apiClient.get<Organization[]>('/organizations')
    } catch {
      return mockOrganizations
    }
  }

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    try {
      return await apiClient.get<Organization>(`/organizations/${id}`)
    } catch {
      return mockOrganizations.find((org) => org.id === id)
    }
  }
}

export const organizationService = new OrganizationService()
