import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Interview,
  InterviewStatus,
  CreateInterviewDto,
  UpdateInterviewDto
} from '../models';

/**
 * Service for managing interviews
 * Connects to Spring Boot REST API
 */
@Injectable({
  providedIn: 'root'
})
export class InterviewsService {

  private readonly API_URL = 'http://localhost:8080/api/v1/interviews';

  constructor(private http: HttpClient) {}

  /**
   * Get all interviews with optional filters
   */
  getAll(from?: string, to?: string, status?: InterviewStatus): Observable<Interview[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (status) params = params.set('status', status);
    return this.http.get<Interview[]>(this.API_URL, { params });
  }

  /**
   * Get interview by ID
   */
  getById(id: string): Observable<Interview> {
    return this.http.get<Interview>(`${this.API_URL}/${id}`);
  }

  /**
   * Get interviews for a specific application
   */
  getByApplication(applicationId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.API_URL}/by-application/${applicationId}`);
  }

  /**
   * Create a new interview
   */
  create(dto: CreateInterviewDto): Observable<Interview> {
    return this.http.post<Interview>(this.API_URL, dto);
  }

  /**
   * Update an interview (partial)
   */
  update(id: string, dto: UpdateInterviewDto): Observable<Interview> {
    return this.http.patch<Interview>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Delete an interview
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
