import { mockSponsorLeads, mockSponsorPackages } from '../data/mockData.ts'
import type { SponsorLead, SponsorPackage, PipelineStage } from '../types/sponsorship.ts'

export class SponsorshipService {
  async getPackages(): Promise<SponsorPackage[]> {
    return Promise.resolve([...mockSponsorPackages])
  }

  async getLeads(): Promise<SponsorLead[]> {
    return Promise.resolve([...mockSponsorLeads])
  }

  async updateStage(leadId: string, stage: PipelineStage): Promise<SponsorLead> {
    const lead = mockSponsorLeads.find((l) => l.id === leadId)
    if (lead) {
      lead.stage = stage
      return Promise.resolve({ ...lead })
    }
    throw new Error('Data mitra sponsor tidak ditemukan')
  }

  async generateAIEmailDraft(params: {
    companyName: string
    contactPerson: string
    packageName: string
    eventTitle: string
    tone?: 'formal' | 'warm'
  }): Promise<string> {
    const isFormal = params.tone !== 'warm'
    const greeting = isFormal
      ? `Yth. ${params.contactPerson}\nPerwakilan Manajemen ${params.companyName}\ndi Tempat\n\nDengan hormat,`
      : `Halo ${params.contactPerson} & Tim ${params.companyName},\n\nSalam semangat kemahasiswaan!`

    const closing = isFormal
      ? `Hormat kami,\nTim Divisi Sponsorship & Kemitraan Convena 2026\nHimpunan Mahasiswa Informatika ITB`
      : `Salam hangat,\nTim Kemitraan Mahasiswa Convena`

    const letter = `${greeting}

Sehubungan dengan akan diselenggarakannya agenda tahunan mahasiswa berskala nasional "${params.eventTitle}", kami dari panitia pelaksana bermaksud mengundang ${params.companyName} untuk berkolaborasi strategis sebagai mitra sponsor resmi pada kategori ${params.packageName}.

Melalui kemitraan ini, ${params.companyName} akan memperoleh akses eksklusif:
1. Paparan identitas brand kepada lebih dari 1.000+ mahasiswa berprestasi dan talenta digital perguruan tinggi terkemuka.
2. Penempatan logo terkemuka pada seluruh media publikasi utama (backdrop stage, umbul-umbul, media sosial, dan materi cetak resmi).
3. Hak istimewa stan pameran booth interaktif serta sesi jejaring rekrutmen talenta muda potensial.

Bersama surat ini, kami lampirkan dokumen proposal resmi Convena 2026 sebagai bahan pertimbangan Bapak/Ibu. Kami sangat antusias untuk mendiskusikan peluang kolaborasi sinergis ini lebih lanjut melalui pertemuan tatap muka maupun daring pada waktu yang disepakati.

Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.

${closing}`

    return Promise.resolve(letter)
  }
}

export const sponsorshipService = new SponsorshipService()
