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
  SCHOOL_FORUM = 'SCHOOL_FORUM',
  OTHER = 'OTHER'
}

/**
 * Labels displayed in the UI
 */
export const ApplicationSourceLabels: Record<ApplicationSource, string> = {
  [ApplicationSource.LINKEDIN]: 'LinkedIn',
  [ApplicationSource.COMPANY_WEBSITE]: 'Site entreprise',
  [ApplicationSource.REFERRAL]: 'Recommandation',
  [ApplicationSource.JOB_BOARD]: "Site d'emploi",
  [ApplicationSource.EMAIL]: 'Email',
  [ApplicationSource.SCHOOL_FORUM]: 'Forum école',
  [ApplicationSource.OTHER]: 'Autre'
};
