import { mockOrganizations } from '../data/mockData.ts'
import type { Organization } from '../types/organization.ts'

export class OrganizationService {
  async getOrganizations(): Promise<Organization[]> {
    return Promise.resolve([...mockOrganizations])
  }

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    const org = mockOrganizations.find((o) => o.id === id)
    return Promise.resolve(org)
  }
}

export const organizationService = new OrganizationService()
