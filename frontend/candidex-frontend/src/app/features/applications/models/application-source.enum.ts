/**
 * Possible sources for a job application
 * Based on DOMAIN.md section 3.2
 */
export enum ApplicationSource {
  LINKEDIN = 'LINKEDIN',
  COMPANY_WEBSITE = 'COMPANY_WEBSITE',
  REFERRAL = 'REFERRAL',
  JOB_BOARD = 'JOB_BOARD',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER'
}

/**
 * Labels displayed in the UI
 */
export const ApplicationSourceLabels: Record<ApplicationSource, string> = {
  [ApplicationSource.LINKEDIN]: 'LinkedIn',
  [ApplicationSource.COMPANY_WEBSITE]: 'Company Website',
  [ApplicationSource.REFERRAL]: 'Referral',
  [ApplicationSource.JOB_BOARD]: 'Job Board',
  [ApplicationSource.EMAIL]: 'Email',
  [ApplicationSource.OTHER]: 'Other'
};
