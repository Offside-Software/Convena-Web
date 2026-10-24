import { useMemo } from 'react'
import type { EventRole } from '../types/membership.ts'

export function useEventAuth(currentRole?: EventRole | string | null) {
  const role = (currentRole?.toLowerCase() || 'attendee') as EventRole

  return useMemo(() => {
    const isOwner = role === 'owner'
    const isAdmin = role === 'admin'
    const isCommittee = role === 'committee'
    const isTreasurer = role === 'treasurer'
    const isSponsor = role === 'sponsor'
    const isAttendee = role === 'attendee'

    return {
      role,
      isOwner,
      isAdmin,
      isCommittee,
      isTreasurer,
      isSponsor,
      isAttendee,
      // Permission helpers
      canEditSettings: isOwner || isAdmin,
      canDeleteEvent: isOwner,
      canManageTeam: isOwner || isAdmin,
      canViewTeam: isOwner || isAdmin || isCommittee || isTreasurer,
      canScanTickets: isOwner || isAdmin || isCommittee,
      canViewBudget: isOwner || isAdmin || isCommittee || isTreasurer,
      canSubmitSpj: isOwner || isAdmin || isCommittee || isTreasurer,
      canAuditSpj: isOwner || isAdmin || isTreasurer,
      canManageSponsors: isOwner || isAdmin || isCommittee,
      canViewDeliverables: isOwner || isAdmin || isCommittee || isSponsor,
      canIssueCertificates: isOwner || isAdmin || isCommittee,
    }
  }, [role])
}
