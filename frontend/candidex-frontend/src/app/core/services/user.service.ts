import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, UpdateProfileDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private readonly API_URL = 'http://localhost:8080/api/v1/users';
  
  constructor(private http: HttpClient) {}
  
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/profile`);
  }
  
  updateProfile(dto: UpdateProfileDto): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/profile`, dto);
  }
  
  uploadCv(file: File): Observable<{ filename: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string; message: string }>(`${this.API_URL}/profile/cv`, formData);
  }
  
  getCvUrl(): string {
    return `${this.API_URL}/profile/cv`;
  }
  
  getCvBlob(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/profile/cv`, { responseType: 'blob' });
  }
  
  deleteCv(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/profile/cv`);
  }
}
