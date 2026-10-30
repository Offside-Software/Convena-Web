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
  role: 'attendee' | 'speaker' | 'committee' | 'winner'
  verified: boolean
  qrCodeUrl?: string
  signatories: Array<{
    name: string
    title: string
  }>
}
