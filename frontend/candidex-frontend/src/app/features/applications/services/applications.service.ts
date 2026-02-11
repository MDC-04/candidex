import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationSource,
  ApplicationStatus,
  CreateApplicationDto,
  UpdateApplicationDto
} from '../models';

/**
 * Query parameters for listing applications
 * Based on API.md section 2.2
 */
export interface ApplicationListParams {
  status?: ApplicationStatus;
  source?: ApplicationSource;
  tag?: string;
  q?: string; // free text search
  from?: string; // ISO date
  to?: string; // ISO date
  page?: number; // default 1
  size?: number; // default 20, max 100
  sort?: string; // e.g., "updatedAt,desc"
}

/**
 * Paginated response for list endpoint
 * Based on API.md section 2.2
 */
export interface PaginatedApplications {
  items: Application[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Service for managing job applications
 * 
 * Connects to Spring Boot REST API at http://localhost:8080/api/v1
 * 
 * IMPORTANT: This service is framework-agnostic (pure TypeScript + RxJS)
 * and can be reused in mobile apps (Ionic/Capacitor/React Native).
 */
@Injectable({
  providedIn: 'root' // Singleton instance for the entire app
})
export class ApplicationsService {
  
  private readonly API_URL = 'http://localhost:8080/api/v1/applications';

  constructor(private http: HttpClient) {}

  /**
   * Get all applications with optional filters and pagination
   * 
   * @param params Query parameters (status, source, search, pagination, etc.)
   * @returns Observable of paginated applications
   * 
   * API Contract: GET /api/v1/applications
   */
  getAll(params?: ApplicationListParams): Observable<PaginatedApplications> {
    let httpParams = new HttpParams();

    // Add query parameters
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.source) {
      httpParams = httpParams.set('source', params.source);
    }
    if (params?.tag) {
      httpParams = httpParams.set('tag', params.tag);
    }
    if (params?.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params?.from) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params?.to) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<PaginatedApplications>(this.API_URL, { params: httpParams });
  }

  /**
   * Get a single application by ID
   * 
   * @param id Application ID
   * @returns Observable of application
   * 
   * API Contract: GET /api/v1/applications/{id}
   */
  getById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.API_URL}/${id}`);
  }

  /**
   * Create a new application
   * 
   * @param dto Application data (without id, userId, timestamps)
   * @returns Observable of created application
   * 
   * API Contract: POST /api/v1/applications
   */
  create(dto: CreateApplicationDto): Observable<Application> {
    return this.http.post<Application>(this.API_URL, dto);
  }

  /**
   * Update an existing application (partial update)
   * 
   * @param id Application ID
   * @param dto Partial application data to update
   * @returns Observable of updated application
   * 
   * API Contract: PATCH /api/v1/applications/{id}
   */
  update(id: string, dto: UpdateApplicationDto): Observable<Application> {
    return this.http.patch<Application>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Delete an application
   * 
   * @param id Application ID
   * @returns Observable that completes when deletion is done
   * 
   * API Contract: DELETE /api/v1/applications/{id}
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
