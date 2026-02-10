import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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
 * Currently uses mock data (in-memory).
 * In production, this will call the REST API via HttpClient.
 * 
 * IMPORTANT: This service is framework-agnostic (pure TypeScript + RxJS)
 * and can be reused in mobile apps (Ionic/Capacitor/React Native).
 */
@Injectable({
  providedIn: 'root' // Singleton instance for the entire app
})
export class ApplicationsService {
  
  /**
   * Mock data for development
   * TODO: Replace with real HTTP calls when backend is ready
   */
  private mockApplications: Application[] = [
    {
      id: 'app-1',
      userId: 'user-123',
      companyName: 'Google',
      roleTitle: 'Software Engineer',
      location: 'Paris',
      source: ApplicationSource.LINKEDIN,
      status: ApplicationStatus.APPLIED,
      appliedDate: '2026-01-15',
      salaryMin: 60000,
      salaryMax: 80000,
      currency: 'EUR',
      tags: ['javascript', 'angular', 'remote'],
      links: {
        jobPostingUrl: 'https://linkedin.com/jobs/google-swe',
        companyWebsiteUrl: 'https://careers.google.com'
      },
      notes: 'Applied through LinkedIn. Referral from John Doe.',
      nextAction: {
        date: '2026-02-15',
        note: 'Follow up if no response',
        done: false
      },
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z'
    },
    {
      id: 'app-2',
      userId: 'user-123',
      companyName: 'Meta',
      roleTitle: 'Frontend Developer',
      location: 'Remote',
      source: ApplicationSource.COMPANY_WEBSITE,
      status: ApplicationStatus.HR_INTERVIEW,
      appliedDate: '2026-01-10',
      salaryMin: 70000,
      salaryMax: 90000,
      currency: 'EUR',
      tags: ['react', 'typescript'],
      links: {
        jobPostingUrl: 'https://meta.com/careers/frontend',
      },
      notes: 'HR interview scheduled for next week.',
      nextAction: {
        date: '2026-02-10',
        note: 'Prepare for HR interview',
        done: false
      },
      createdAt: '2026-01-10T14:20:00Z',
      updatedAt: '2026-02-01T09:15:00Z'
    },
    {
      id: 'app-3',
      userId: 'user-123',
      companyName: 'Stripe',
      roleTitle: 'Full Stack Engineer',
      location: 'Dublin, Ireland',
      source: ApplicationSource.REFERRAL,
      status: ApplicationStatus.TECH_INTERVIEW,
      appliedDate: '2026-01-05',
      salaryMin: 75000,
      salaryMax: 95000,
      currency: 'EUR',
      tags: ['java', 'spring boot', 'mongodb'],
      links: {
        jobPostingUrl: 'https://stripe.com/jobs/fullstack',
        resumeUrl: 'https://drive.google.com/resume.pdf'
      },
      notes: 'Technical interview coming up. Focus on system design.',
      nextAction: {
        date: '2026-02-08',
        note: 'Tech interview - prepare system design',
        done: false
      },
      createdAt: '2026-01-05T11:00:00Z',
      updatedAt: '2026-02-03T16:45:00Z'
    },
    {
      id: 'app-4',
      userId: 'user-123',
      companyName: 'Datadog',
      roleTitle: 'Backend Engineer',
      location: 'Paris',
      source: ApplicationSource.JOB_BOARD,
      status: ApplicationStatus.REJECTED,
      appliedDate: '2025-12-20',
      salaryMin: 55000,
      salaryMax: 70000,
      currency: 'EUR',
      tags: ['python', 'kubernetes'],
      notes: 'Rejected after technical interview. Good experience overall.',
      createdAt: '2025-12-20T09:30:00Z',
      updatedAt: '2026-01-10T14:20:00Z'
    },
    {
      id: 'app-5',
      userId: 'user-123',
      companyName: 'Shopify',
      roleTitle: 'Senior Developer',
      location: 'Remote',
      source: ApplicationSource.LINKEDIN,
      status: ApplicationStatus.OFFER,
      appliedDate: '2025-12-15',
      salaryMin: 80000,
      salaryMax: 100000,
      currency: 'EUR',
      tags: ['ruby', 'rails', 'remote'],
      links: {
        jobPostingUrl: 'https://shopify.com/careers',
        companyWebsiteUrl: 'https://shopify.com'
      },
      notes: 'Offer received! Negotiating salary and benefits.',
      nextAction: {
        date: '2026-02-12',
        note: 'Respond to offer',
        done: false
      },
      createdAt: '2025-12-15T15:00:00Z',
      updatedAt: '2026-02-05T10:30:00Z'
    }
  ];

  constructor() {}

  /**
   * Get all applications with optional filters and pagination
   * 
   * @param params Query parameters (status, source, search, pagination, etc.)
   * @returns Observable of paginated applications
   * 
   * API Contract: GET /api/v1/applications
   */
  getAll(params?: ApplicationListParams): Observable<PaginatedApplications> {
    // Simulate API delay (300ms)
    return of(this.mockApplications).pipe(
      delay(300),
      map(apps => {
        let filtered = [...apps];

        // Filter by status
        if (params?.status) {
          filtered = filtered.filter(app => app.status === params.status);
        }

        // Filter by source
        if (params?.source) {
          filtered = filtered.filter(app => app.source === params.source);
        }

        // Filter by tag
        if (params?.tag) {
          filtered = filtered.filter(app => 
            app.tags?.some(t => t.toLowerCase().includes(params.tag!.toLowerCase()))
          );
        }

        // Free text search (company name, role title, notes)
        if (params?.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(app =>
            app.companyName.toLowerCase().includes(query) ||
            app.roleTitle.toLowerCase().includes(query) ||
            app.notes?.toLowerCase().includes(query)
          );
        }

        // Filter by date range
        if (params?.from) {
          filtered = filtered.filter(app => 
            app.appliedDate && app.appliedDate >= params.from!
          );
        }
        if (params?.to) {
          filtered = filtered.filter(app => 
            app.appliedDate && app.appliedDate <= params.to!
          );
        }

        // Sort (default: updatedAt,desc)
        const sortField = params?.sort?.split(',')[0] || 'updatedAt';
        const sortDir = params?.sort?.split(',')[1] || 'desc';
        filtered.sort((a, b) => {
          const aVal = (a as any)[sortField];
          const bVal = (b as any)[sortField];
          if (sortDir === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });

        // Pagination
        const page = params?.page || 1;
        const size = params?.size || 20;
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / size);
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const items = filtered.slice(startIndex, endIndex);

        return {
          items,
          page,
          size,
          totalItems,
          totalPages
        };
      })
    );
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
    return of(this.mockApplications).pipe(
      delay(200),
      map(apps => {
        const app = apps.find(a => a.id === id);
        if (!app) {
          throw new Error(`Application with id ${id} not found`);
        }
        return app;
      })
    );
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
    return of(dto).pipe(
      delay(400),
      map(data => {
        // Simulate backend generating id, userId, timestamps
        const newApp: Application = {
          id: `app-${Date.now()}`,
          userId: 'user-123', // Simulated auth user
          ...data,
          status: data.status || ApplicationStatus.APPLIED, // Default status
          currency: data.currency || 'EUR', // Default currency
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Add to mock data
        this.mockApplications.unshift(newApp); // Add at beginning

        return newApp;
      })
    );
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
    return of({ id, dto }).pipe(
      delay(400),
      map(({ id, dto }) => {
        const index = this.mockApplications.findIndex(a => a.id === id);
        if (index === -1) {
          throw new Error(`Application with id ${id} not found`);
        }

        // Merge changes
        const updated: Application = {
          ...this.mockApplications[index],
          ...dto,
          updatedAt: new Date().toISOString() // Update timestamp
        };

        // Update in mock data
        this.mockApplications[index] = updated;

        return updated;
      })
    );
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
    return of(id).pipe(
      delay(300),
      map(id => {
        const index = this.mockApplications.findIndex(a => a.id === id);
        if (index === -1) {
          throw new Error(`Application with id ${id} not found`);
        }

        // Remove from mock data
        this.mockApplications.splice(index, 1);

        return undefined; // void
      })
    );
  }
}
