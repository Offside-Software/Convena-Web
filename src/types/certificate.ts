export type CertificateCategory =
  | 'winner'
  | 'attendance'
  | 'group'
  | 'speaker'
  | 'committee'
  | 'custom'

export type CertificateRole =
  | 'attendee'
  | 'speaker'
  | 'committee'
  | 'winner'
  | 'group'
  | 'custom'

export type BorderStyle =
  | 'flat'
  | 'rounded'
  | 'double'
  | 'ornate'
  | 'minimal'
  | 'none'

export type CertificateOrientation = 'landscape' | 'portrait'

export type RecipientType = 'participant' | 'group' | 'custom'

export interface CertificateColors {
  background: string
  surface: string
  primary: string
  accent: string
  text: string
  mutedText: string
}

export interface SignatorySlot {
  id: string
  name: string
  title: string // e.g. Ketua Pelaksana, Rektor, Dekan, Ketua Himpunan
  idNumber?: string // NIP / NIDN / NIM opsional
}

export interface CertificateTemplateDesign {
  colors: CertificateColors
  borderStyle: BorderStyle
  borderWidth: number
  orientation: CertificateOrientation
  logoUrl?: string // Base64 data URL or image URL
  embedLogoInQr: boolean // Embed logo inside main Certificate QR (signatory QRs never have images)
  badgeText?: string // e.g. SERTIFIKAT KOMPETISI NASIONAL
  title: string // e.g. SERTIFIKAT PENGHARGAAN
  subtitle: string // e.g. Diberikan dengan bangga kepada:
  description: string // Supports {{nama}}, {{event}}, {{peran}}, {{peringkat}}, {{tim}}, {{anggota}}, {{instansi}}, {{tanggal}}
  showStudentId: boolean
  showGroupMembers: boolean
  signatories: SignatorySlot[]
}

export interface CertificateTemplate extends CertificateTemplateDesign {
  id: string
  eventId: string
  name: string
  category: CertificateCategory
  updatedAt?: string
}

export interface CertificateRecipientInput {
  id: string
  type: RecipientType
  name: string // Nama peserta, nama tim, atau nama penerima kustom
  email?: string
  studentId?: string // NIM / Nomor Identitas
  institution?: string // Kampus / Instansi
  category: CertificateCategory
  roleLabel?: string // e.g. Peserta, Pembicara Utama, Panitia Inti
  rank?: string // e.g. Juara 1, Best Innovation, Gold Medal
  groupName?: string // Nama Tim / Kelompok
  groupMembers?: string[] // Daftar nama anggota kelompok
  registrationId?: string
}

export interface IssueCertificatesPayload {
  eventId: string
  templateId?: string
  template: CertificateTemplateDesign
  category: CertificateCategory
  issueDate: string
  recipients: CertificateRecipientInput[]
}

export interface Certificate {
  id: string
  certificateNumber: string // e.g. CNV-2026-ITB-8821
  recipientName: string
  recipientEmail: string
  studentId?: string
  company: string
  eventId: string
  eventTitle: string
  organizationName: string
  issueDate: string
  role: CertificateRole
  verified: boolean
  qrCodeUrl?: string
  signatories: Array<{
    name: string
    title: string
    idNumber?: string
    signatureQrValue?: string
  }>
  // Extended fields for template & recipient variations
  category?: CertificateCategory
  recipientType?: RecipientType
  groupName?: string
  groupMembers?: string[]
  rank?: string
  roleLabel?: string
  templateId?: string
  templateSnapshot?: CertificateTemplateDesign
}
