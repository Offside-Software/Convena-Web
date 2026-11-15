import { apiClient } from './api/client.ts'
import type {
  Certificate,
  CertificateCategory,
  CertificateRole,
  CertificateTemplate,
  IssueCertificatesPayload,
} from '../types/certificate.ts'

export function mapCategoryToRole(category: CertificateCategory): CertificateRole {
  switch (category) {
    case 'winner':
      return 'winner'
    case 'attendance':
      return 'attendee'
    case 'speaker':
      return 'speaker'
    case 'committee':
      return 'committee'
    case 'group':
      return 'group'
    default:
      return 'custom'
  }
}

export function formatCertificateNumber(
  eventSlugOrTitle: string,
  category: CertificateCategory,
  sequenceIndex: number
): string {
  const year = new Date().getFullYear()
  const cleanCode =
    eventSlugOrTitle
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4) || 'CNV'
  const categoryPrefix: Record<CertificateCategory, string> = {
    winner: 'WIN',
    attendance: 'ATT',
    group: 'GRP',
    speaker: 'SPK',
    committee: 'COM',
    custom: 'CRT',
  }
  const suffix = String(1000 + sequenceIndex).slice(-4)
  return `CNV-${year}-${cleanCode}-${categoryPrefix[category]}-${suffix}`
}

export function buildCertificateVerifyUrl(certificateNumber: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://convena.id'
  return `${origin}/verify/${encodeURIComponent(certificateNumber)}`
}

export function buildSignatoryQrPayload(params: {
  certificateNumber: string
  eventId: string
  signerName: string
  signerTitle: string
  signerIdNumber?: string
  index: number
}): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://convena.id'
  const url = new URL(
    `/verify/${encodeURIComponent(params.certificateNumber)}`,
    origin
  )
  url.searchParams.set('sig', String(params.index + 1))
  url.searchParams.set('signer', params.signerName)
  url.searchParams.set('role', params.signerTitle)
  if (params.signerIdNumber) {
    url.searchParams.set('nip', params.signerIdNumber)
  }
  return url.toString()
}

export class CertificateService {
  async verifyCertificate(code: string): Promise<Certificate | null> {
    const cleanCode = code.trim().toUpperCase()
    try {
      return await apiClient.get<Certificate>(
        `/certificates/verify/${encodeURIComponent(cleanCode)}`
      )
    } catch {
      return null
    }
  }

  async getEventTemplates(eventId: string): Promise<CertificateTemplate[]> {
    return await apiClient.get<CertificateTemplate[]>(
      `/events/${encodeURIComponent(eventId)}/certificate-templates`
    )
  }

  async saveEventTemplate(
    eventId: string,
    template: Omit<CertificateTemplate, 'id' | 'eventId'> & { id?: string }
  ): Promise<CertificateTemplate> {
    if (template.id) {
      return await apiClient.put<CertificateTemplate>(
        `/events/${encodeURIComponent(eventId)}/certificate-templates/${encodeURIComponent(template.id)}`,
        { ...template, eventId }
      )
    }
    return await apiClient.post<CertificateTemplate>(
      `/events/${encodeURIComponent(eventId)}/certificate-templates`,
      { ...template, eventId }
    )
  }

  async deleteEventTemplate(eventId: string, templateId: string): Promise<void> {
    await apiClient.delete(
      `/events/${encodeURIComponent(eventId)}/certificate-templates/${encodeURIComponent(templateId)}`
    )
  }

  async getEventCertificates(eventId: string): Promise<Certificate[]> {
    return await apiClient.get<Certificate[]>(
      `/events/${encodeURIComponent(eventId)}/certificates`
    )
  }

  async issueCertificates(
    eventId: string,
    payload: IssueCertificatesPayload
  ): Promise<Certificate[]> {
    return await apiClient.post<Certificate[]>(
      `/events/${encodeURIComponent(eventId)}/certificates`,
      payload
    )
  }

  async revokeCertificate(eventId: string, certificateId: string): Promise<void> {
    await apiClient.delete(
      `/events/${encodeURIComponent(eventId)}/certificates/${encodeURIComponent(certificateId)}`
    )
  }
}

export const certificateService = new CertificateService()
