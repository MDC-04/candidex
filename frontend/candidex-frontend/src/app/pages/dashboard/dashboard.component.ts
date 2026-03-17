import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApplicationsService } from '../../features/applications/services/applications.service';
import { Application, ApplicationStatus, ApplicationStatusLabels } from '../../features/applications/models';
import { HttpErrorService } from '../../core/services/http-error.service';
import { NotificationService } from '../../core/services/notification.service';

interface StatusStats {
  status: ApplicationStatus;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

interface DashboardStats {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
  responseRate: number;
}

interface TimelineEvent {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejection';
  companyName: string;
  roleTitle: string;
  date: Date;
  icon: string;
  color: string;
}

interface WeeklyData {
  week: string;
  applications: number;
  responses: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  loading = false;
  stats: DashboardStats = {
    total: 0,
    applied: 0,
    interviewing: 0,
    offers: 0,
    rejected: 0,
    responseRate: 0
  };
  
  statusStats: StatusStats[] = [];
  recentApplications: Application[] = [];
  timelineEvents: TimelineEvent[] = [];
  weeklyData: WeeklyData[] = [];
  maxWeeklyApplications = 0;
  
  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
    private httpErrorService: HttpErrorService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.loading = true;
    this.applicationsService.getAll({ size: 100 }).subscribe({
      next: (response) => {
        this.calculateStats(response.items);
        this.recentApplications = response.items
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        this.generateTimelineEvents(response.items);
        this.generateWeeklyData(response.items);
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'le chargement du tableau de bord',
            'Impossible de charger le tableau de bord.'
          )
        );
        this.loading = false;
      }
    });
  }
  
  calculateStats(applications: Application[]): void {
    this.stats.total = applications.length;
    
    const statusCounts = new Map<ApplicationStatus, number>();
    applications.forEach(app => {
      statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1);
    });
    
    this.stats.applied = statusCounts.get(ApplicationStatus.APPLIED) || 0;
    this.stats.interviewing = 
      (statusCounts.get(ApplicationStatus.HR_INTERVIEW) || 0) +
      (statusCounts.get(ApplicationStatus.TECH_INTERVIEW) || 0);
    this.stats.offers = statusCounts.get(ApplicationStatus.OFFER) || 0;
    this.stats.rejected = 
      (statusCounts.get(ApplicationStatus.REJECTED) || 0) +
      (statusCounts.get(ApplicationStatus.GHOSTED) || 0);
    
    // Response rate: (interviews + offers) / (total - ghosted)
    const ghosted = statusCounts.get(ApplicationStatus.GHOSTED) || 0;
    const denominator = this.stats.total - ghosted;
    this.stats.responseRate = denominator > 0 
      ? Math.round(((this.stats.interviewing + this.stats.offers) / denominator) * 100)
      : 0;
    
    // Status distribution
    this.statusStats = [
      { status: ApplicationStatus.APPLIED, label: ApplicationStatusLabels[ApplicationStatus.APPLIED], count: statusCounts.get(ApplicationStatus.APPLIED) || 0, color: '#2196F3', percentage: 0 },
      { status: ApplicationStatus.HR_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.HR_INTERVIEW], count: statusCounts.get(ApplicationStatus.HR_INTERVIEW) || 0, color: '#FF9800', percentage: 0 },
      { status: ApplicationStatus.TECH_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.TECH_INTERVIEW], count: statusCounts.get(ApplicationStatus.TECH_INTERVIEW) || 0, color: '#9C27B0', percentage: 0 },
      { status: ApplicationStatus.OFFER, label: ApplicationStatusLabels[ApplicationStatus.OFFER], count: statusCounts.get(ApplicationStatus.OFFER) || 0, color: '#4CAF50', percentage: 0 },
      { status: ApplicationStatus.REJECTED, label: ApplicationStatusLabels[ApplicationStatus.REJECTED], count: statusCounts.get(ApplicationStatus.REJECTED) || 0, color: '#F44336', percentage: 0 },
      { status: ApplicationStatus.GHOSTED, label: ApplicationStatusLabels[ApplicationStatus.GHOSTED], count: statusCounts.get(ApplicationStatus.GHOSTED) || 0, color: '#9E9E9E', percentage: 0 }
    ];
    
    this.statusStats.forEach(stat => {
      stat.percentage = this.stats.total > 0 ? Math.round((stat.count / this.stats.total) * 100) : 0;
    });
  }
  
  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }
  
  goToApplications(): void {
    this.router.navigate(['/applications']);
  }
  
  getStatusLabel(status: ApplicationStatus): string {
    return ApplicationStatusLabels[status];
  }
  
  getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.APPLIED]: '#2196F3',
      [ApplicationStatus.HR_INTERVIEW]: '#FF9800',
      [ApplicationStatus.TECH_INTERVIEW]: '#9C27B0',
      [ApplicationStatus.OFFER]: '#4CAF50',
      [ApplicationStatus.REJECTED]: '#F44336',
      [ApplicationStatus.GHOSTED]: '#9E9E9E'
    };
    return colors[status];
  }
  
  private generateTimelineEvents(applications: Application[]): void {
    this.timelineEvents = [...applications]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(app => {
        let type: TimelineEvent['type'] = 'application';
        let icon = 'send';
        let color = '#2196F3';
        
        switch (app.status) {
          case ApplicationStatus.HR_INTERVIEW:
          case ApplicationStatus.TECH_INTERVIEW:
            type = 'interview';
            icon = 'event';
            color = '#FF9800';
            break;
          case ApplicationStatus.OFFER:
            type = 'offer';
            icon = 'star';
            color = '#4CAF50';
            break;
          case ApplicationStatus.REJECTED:
          case ApplicationStatus.GHOSTED:
            type = 'rejection';
            icon = 'cancel';
            color = '#F44336';
            break;
        }
        
        return {
          id: app.id,
          type,
          companyName: app.companyName,
          roleTitle: app.roleTitle,
          date: new Date(app.updatedAt),
          icon,
          color
        };
      });
  }
  
  private generateWeeklyData(applications: Application[]): void {
    const currentWeekStart = this.getStartOfWeek(new Date());
    const weekStarts = Array.from({ length: 8 }, (_, index) => {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - (7 - index) * 7);
      return start;
    });

    const weeklyBuckets: WeeklyData[] = weekStarts.map((_, index) => ({
      week: index === 7 ? 'Cette semaine' : `S-${7 - index}`,
      applications: 0,
      responses: 0
    }));

    applications.forEach(app => {
      const applicationDate = app.appliedDate ? new Date(app.appliedDate) : new Date(app.createdAt);
      const applicationWeekIndex = this.resolveWeekIndex(applicationDate, weekStarts);
      if (applicationWeekIndex !== -1) {
        weeklyBuckets[applicationWeekIndex].applications += 1;
      }

      const hasResponse = app.status !== ApplicationStatus.APPLIED && app.status !== ApplicationStatus.GHOSTED;
      if (!hasResponse) {
        return;
      }

      const responseDate = new Date(app.updatedAt);
      const responseWeekIndex = this.resolveWeekIndex(responseDate, weekStarts);
      if (responseWeekIndex !== -1) {
        weeklyBuckets[responseWeekIndex].responses += 1;
      }
    });

    this.weeklyData = weeklyBuckets;
    this.maxWeeklyApplications = Math.max(
      ...this.weeklyData.map(d => Math.max(d.applications, d.responses)),
      1
    );
  }

  private getStartOfWeek(date: Date): Date {
    const normalized = new Date(date);
    const day = (normalized.getDay() + 6) % 7; // Monday = 0
    normalized.setDate(normalized.getDate() - day);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private resolveWeekIndex(date: Date, weekStarts: Date[]): number {
    if (Number.isNaN(date.getTime())) {
      return -1;
    }

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    for (let i = 0; i < weekStarts.length; i++) {
      const start = weekStarts[i];
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      if (normalized >= start && normalized < end) {
        return i;
      }
    }

    return -1;
  }
  
  getEventTypeLabel(type: TimelineEvent['type']): string {
    const labels = {
      'application': 'Candidature envoyée',
      'interview': 'Entretien programmé',
      'offer': 'Offre reçue',
      'rejection': 'Candidature refusée'
    };
    return labels[type];
  }
  
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }
}
