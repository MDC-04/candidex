export enum ApplicationStatus {
  WISHLIST = 'WISHLIST',
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED'
}

export interface Note {
  id?: string;
  content: string;
  createdAt: Date;
}

export interface Reminder {
  id?: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
}

export interface Application {
  id?: string;
  userId?: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  salary?: string;
  jobUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: Note[];
  reminders?: Reminder[];
  createdAt?: Date;
  updatedAt?: Date;
  appliedDate?: Date;
}

export interface DashboardStats {
  totalApplications: number;
  appliedCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  statusBreakdown: { [key: string]: number };
}
