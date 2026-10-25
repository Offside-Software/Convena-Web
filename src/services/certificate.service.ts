import { apiClient } from './api/client.ts'
import { mockCertificates } from '../data/mockData.ts'
import type { Certificate } from '../types/certificate.ts'

export class CertificateService {
  async verifyCertificate(code: string): Promise<Certificate | null> {
    const cleanCode = code.trim().toUpperCase()
    try {
      return await apiClient.get<Certificate>(`/certificates/verify/${encodeURIComponent(cleanCode)}`)
    } catch {
      return mockCertificates[cleanCode] || null
    }
  }
}

export const certificateService = new CertificateService()
