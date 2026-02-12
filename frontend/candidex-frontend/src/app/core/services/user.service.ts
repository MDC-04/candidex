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
}
