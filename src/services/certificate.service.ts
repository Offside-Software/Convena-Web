import { mockCertificates } from '../data/mockData.ts'
import type { Certificate } from '../types/certificate.ts'

export class CertificateService {
  async verifyCertificate(code: string): Promise<Certificate | null> {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return Promise.resolve(null)

    // 1. Direct match in mock database
    if (mockCertificates[cleanCode]) {
      return Promise.resolve(mockCertificates[cleanCode])
    }

    // 2. Dynamic generation for test format starting with CNV-
    if (cleanCode.startsWith('CNV-')) {
      const generatedCert: Certificate = {
        id: `cert-${Date.now().toString().slice(-4)}`,
        certificateNumber: cleanCode,
        recipientName: 'Kandidat Mahasiswa Berprestasi',
        recipientEmail: 'peserta@student.ac.id',
        studentId: '13522999',
        university: 'Institut Teknologi Bandung',
        eventId: 'evt-arkavidia-2026',
        eventTitle: 'Arkavidia 9.0: National Tech Festival & Hackathon',
        organizationName: 'HMIF ITB',
        issueDate: '2026-10-25',
        role: 'attendee',
        verified: true,
        signatories: [
          { name: 'Dr. Techn. Saiful Akbar, S.T., M.T.', title: 'Ketua Program Studi STEI ITB' },
          { name: 'Arya Pratama', title: 'Ketua Pelaksana Arkavidia 9.0' },
        ],
      }
      return Promise.resolve(generatedCert)
    }

    // Return null for non-conforming or unknown test codes (to demonstrate invalid certificate feedback)
    return Promise.resolve(null)
  }
}

export const certificateService = new CertificateService()
