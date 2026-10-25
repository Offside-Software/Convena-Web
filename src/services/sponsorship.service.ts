import { apiClient } from './api/client.ts'
import { mockSponsorLeads, mockSponsorPackages } from '../data/mockData.ts'
import type { SponsorLead, SponsorPackage, PipelineStage } from '../types/sponsorship.ts'

export class SponsorshipService {
  async getPackages(): Promise<SponsorPackage[]> {
    try {
      return await apiClient.get<SponsorPackage[]>('/sponsorship/packages')
    } catch {
      return mockSponsorPackages
    }
  }

  async getLeads(): Promise<SponsorLead[]> {
    try {
      return await apiClient.get<SponsorLead[]>('/sponsorship/leads')
    } catch {
      return mockSponsorLeads
    }
  }

  async updateStage(leadId: string, stage: PipelineStage): Promise<SponsorLead> {
    try {
      return await apiClient.patch<SponsorLead>(`/sponsorship/leads/${leadId}`, { stage })
    } catch {
      const lead = mockSponsorLeads.find((l) => l.id === leadId)
      if (lead) {
        lead.stage = stage
        return { ...lead }
      }
      throw new Error('Lead not found')
    }
  }

  async generateAIEmailDraft(params: {
    companyName: string
    contactPerson: string
    packageName: string
    eventTitle: string
    tone?: 'formal' | 'warm'
  }): Promise<string> {
    try {
      const res = await apiClient.post<{ draft: string }>('/ai/generate-proposal-email', params)
      return res.draft
    } catch {
      // Offline fallback template in Indonesian formal business standard
      return `Yth. ${params.contactPerson}
Perwakilan Manajemen ${params.companyName}
di Tempat

Dengan hormat,

Sehubungan dengan akan diselenggarakannya agenda tahunan mahasiswa terbesar "${params.eventTitle}", kami dari panitia pelaksana bermaksud mengundang ${params.companyName} untuk berkolaborasi strategis sebagai mitra sponsor resmi pada kategori ${params.packageName}.

Melalui kemitraan ini, ${params.companyName} akan memperoleh akses langsung kepada lebih dari 1.000+ mahasiswa berprestasi dan talenta digital, penempatan identitas brand pada seluruh media publikasi utama, serta hak eksklusif dalam sesi jejaring karir.

Bersama surat ini, kami lampirkan dokumen proposal resmi Convena 2026. Kami sangat antusias untuk mendiskusikan peluang kolaborasi ini lebih lanjut pada waktu yang Bapak/Ibu tentukan.

Hormat kami,
Tim Divisi Sponsorship & Kemitraan Convena`
    }
  }
}

export const sponsorshipService = new SponsorshipService()
