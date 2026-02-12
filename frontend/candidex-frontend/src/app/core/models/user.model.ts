export interface UpdateProfileDto {
  fullName?: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}
