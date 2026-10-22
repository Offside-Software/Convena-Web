export type PipelineStage =
  | 'prospect'
  | 'contacted'
  | 'proposal_sent'
  | 'negotiating'
  | 'committed'
  | 'paid'
  | 'rejected'

export interface SponsorPackage {
  id: string
  name: string // e.g. Platinum, Gold, Silver
  price: number
  slotLimit: number
  slotsFilled: number
  deliverables: string[]
  color: string
}

export interface SponsorLead {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  stage: PipelineStage
  packageInterest?: string
  value: number
  lastContactDate: string
  notes: string
  assignedCommittee: string
}
