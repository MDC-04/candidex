import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { Application, ApplicationStatus } from '../../models/application.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  applications: Application[] = [];
  isLoading = true;
  
  columns = [
    { status: ApplicationStatus.WISHLIST, title: 'Wishlist', icon: '📋' },
    { status: ApplicationStatus.APPLIED, title: 'Applied', icon: '📝' },
    { status: ApplicationStatus.INTERVIEW, title: 'Interview', icon: '💼' },
    { status: ApplicationStatus.OFFER, title: 'Offer', icon: '🎉' },
    { status: ApplicationStatus.REJECTED, title: 'Rejected', icon: '❌' },
    { status: ApplicationStatus.ACCEPTED, title: 'Accepted', icon: '✅' }
  ];

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
      }
    });
  }

  getApplicationsByStatus(status: ApplicationStatus): Application[] {
    return this.applications.filter(app => app.status === status);
  }

  updateApplicationStatus(application: Application, newStatus: ApplicationStatus): void {
    if (application.id) {
      const updatedApp = { ...application, status: newStatus };
      this.applicationService.updateApplication(application.id, updatedApp).subscribe({
        next: () => this.loadApplications(),
        error: (error) => console.error('Error updating status:', error)
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
