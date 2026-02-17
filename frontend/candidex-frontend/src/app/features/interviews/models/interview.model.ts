/**
 * Interview type enum
 */
export enum InterviewType {
  HR = 'HR',
  TECH = 'TECH',
  MANAGER = 'MANAGER',
  TAKE_HOME = 'TAKE_HOME',
  OTHER = 'OTHER'
}

export const InterviewTypeLabels: Record<InterviewType, string> = {
  [InterviewType.HR]: 'Entretien RH',
  [InterviewType.TECH]: 'Entretien technique',
  [InterviewType.MANAGER]: 'Entretien manager',
  [InterviewType.TAKE_HOME]: 'Test technique',
  [InterviewType.OTHER]: 'Autre'
};

/**
 * Interview mode enum
 */
export enum InterviewMode {
  VIDEO = 'VIDEO',
  ONSITE = 'ONSITE',
  PHONE = 'PHONE'
}

export const InterviewModeLabels: Record<InterviewMode, string> = {
  [InterviewMode.VIDEO]: 'Visio',
  [InterviewMode.ONSITE]: 'Sur site',
  [InterviewMode.PHONE]: 'Téléphone'
};

/**
 * Interview status enum
 */
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  CANCELED = 'CANCELED'
}

export const InterviewStatusLabels: Record<InterviewStatus, string> = {
  [InterviewStatus.SCHEDULED]: 'Planifié',
  [InterviewStatus.DONE]: 'Terminé',
  [InterviewStatus.CANCELED]: 'Annulé'
};

/**
 * Interview entity
 */
export interface Interview {
  id: string;
  userId: string;
  applicationId: string;
  title: string;
  type: InterviewType;
  startAt: string; // ISO datetime
  endAt?: string;
  timezone?: string;
  mode: InterviewMode;
  location?: string;
  meetingUrl?: string;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  checklistItems?: string[];
  questionsToAsk?: string[];
  links?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating an interview
 */
export interface CreateInterviewDto {
  applicationId: string;
  title: string;
  type: InterviewType;
  startAt: string;
  endAt?: string;
  timezone?: string;
  mode: InterviewMode;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  checklistItems?: string[];
  questionsToAsk?: string[];
  links?: string[];
}

/**
 * DTO for updating an interview
 */
export interface UpdateInterviewDto {
  title?: string;
  type?: InterviewType;
  startAt?: string;
  endAt?: string;
  timezone?: string;
  mode?: InterviewMode;
  location?: string;
  meetingUrl?: string;
  status?: InterviewStatus;
  notes?: string;
  feedback?: string;
  checklistItems?: string[];
  questionsToAsk?: string[];
  links?: string[];
}
