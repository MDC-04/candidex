import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, DashboardStats, Note, Reminder } from '../models/application.model';
import { AuthService } from './auth.service';

const API_URL = 'http://localhost:8080/api/applications/';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(API_URL, { headers: this.getHeaders() });
  }

  getApplicationById(id: string): Observable<Application> {
    return this.http.get<Application>(`${API_URL}${id}`, { headers: this.getHeaders() });
  }

  createApplication(application: Application): Observable<Application> {
    return this.http.post<Application>(API_URL, application, { headers: this.getHeaders() });
  }

  updateApplication(id: string, application: Application): Observable<Application> {
    return this.http.put<Application>(`${API_URL}${id}`, application, { headers: this.getHeaders() });
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}${id}`, { headers: this.getHeaders() });
  }

  addNote(id: string, note: Note): Observable<Application> {
    return this.http.post<Application>(`${API_URL}${id}/notes`, note, { headers: this.getHeaders() });
  }

  deleteNote(id: string, noteId: string): Observable<Application> {
    return this.http.delete<Application>(`${API_URL}${id}/notes/${noteId}`, { headers: this.getHeaders() });
  }

  addReminder(id: string, reminder: Reminder): Observable<Application> {
    return this.http.post<Application>(`${API_URL}${id}/reminders`, reminder, { headers: this.getHeaders() });
  }

  updateReminder(id: string, reminderId: string, reminder: Reminder): Observable<Application> {
    return this.http.put<Application>(`${API_URL}${id}/reminders/${reminderId}`, reminder, { headers: this.getHeaders() });
  }

  deleteReminder(id: string, reminderId: string): Observable<Application> {
    return this.http.delete<Application>(`${API_URL}${id}/reminders/${reminderId}`, { headers: this.getHeaders() });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_URL}stats`, { headers: this.getHeaders() });
  }
}
