export interface Division {
  id: string
  name: string
  leadName?: string
  memberCount: number
}

export interface Organization {
  id: string
  name: string
  shortName: string
  company: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  verified: boolean
  memberCount: number
  activeEventsCount: number
  divisions: Division[]
  socials?: {
    instagram?: string
    linkedin?: string
    website?: string
  }
}
