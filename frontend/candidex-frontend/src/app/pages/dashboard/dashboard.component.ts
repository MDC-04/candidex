import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApplicationsService } from '../../features/applications/services/applications.service';
import { Application, ApplicationStatus, ApplicationStatusLabels } from '../../features/applications/models';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
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
  
  constructor(
    private applicationsService: ApplicationsService,
    private router: Router
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
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
}
