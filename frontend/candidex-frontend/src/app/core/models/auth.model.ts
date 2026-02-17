/**
 * Authentication DTOs
 * Based on API.md section 1
 */

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
}

export interface UserInfo {
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
  createdAt?: string;
  updatedAt?: string;
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
  cvFilename?: string;
  cvOriginalFilename?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
