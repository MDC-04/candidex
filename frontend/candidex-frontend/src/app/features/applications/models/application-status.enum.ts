/**
 * Possible statuses for a job application
 * Based on DOMAIN.md section 3.1
 */
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  HR_INTERVIEW = 'HR_INTERVIEW',
  TECH_INTERVIEW = 'TECH_INTERVIEW',
  OFFER = 'OFFER',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  GHOSTED = 'GHOSTED'
}

/**
 * Labels displayed in the UI
 */
export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPLIED]: 'Candidature envoyée',
  [ApplicationStatus.HR_INTERVIEW]: 'Entretien RH',
  [ApplicationStatus.TECH_INTERVIEW]: 'Entretien technique',
  [ApplicationStatus.OFFER]: 'Offre reçue',
  [ApplicationStatus.OFFER_ACCEPTED]: 'Offre acceptée',
  [ApplicationStatus.OFFER_DECLINED]: 'Offre déclinée',
  [ApplicationStatus.REJECTED]: 'Refusée',
  [ApplicationStatus.GHOSTED]: 'Sans réponse'
};
