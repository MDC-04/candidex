/**
 * Possible statuses for a job application
 * Based on DOMAIN.md section 3.1
 */
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  HR_INTERVIEW = 'HR_INTERVIEW',
  TECH_INTERVIEW = 'TECH_INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  GHOSTED = 'GHOSTED'
}

/**
 * Labels displayed in the UI
 */
export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.HR_INTERVIEW]: 'HR Interview',
  [ApplicationStatus.TECH_INTERVIEW]: 'Tech Interview',
  [ApplicationStatus.OFFER]: 'Offer',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.GHOSTED]: 'Ghosted'
};
