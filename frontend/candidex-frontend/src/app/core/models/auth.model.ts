/**
 * Authentication DTOs
 * Based on API.md section 1
 */

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
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
}
