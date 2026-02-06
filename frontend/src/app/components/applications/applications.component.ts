import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { Application, ApplicationStatus } from '../../models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  currentApplication: Application = this.getEmptyApplication();
  searchTerm = '';
  filterStatus: string = 'ALL';

  statuses = Object.values(ApplicationStatus);

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.applicationService.getAllApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredApplications = this.applications.filter(app => {
      const matchesSearch = app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          app.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filterStatus === 'ALL' || app.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentApplication = this.getEmptyApplication();
    this.showModal = true;
  }

  openEditModal(application: Application): void {
    this.isEditMode = true;
    this.currentApplication = { ...application };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentApplication = this.getEmptyApplication();
  }

  saveApplication(): void {
    if (this.isEditMode && this.currentApplication.id) {
      this.applicationService.updateApplication(this.currentApplication.id, this.currentApplication).subscribe({
        next: () => {
          this.loadApplications();
          this.closeModal();
        },
        error: (error) => console.error('Error updating application:', error)
      });
    } else {
      this.applicationService.createApplication(this.currentApplication).subscribe({
        next: () => {
          this.loadApplications();
          this.closeModal();
        },
        error: (error) => console.error('Error creating application:', error)
      });
    }
  }

  deleteApplication(id: string | undefined): void {
    if (id && confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(id).subscribe({
        next: () => this.loadApplications(),
        error: (error) => console.error('Error deleting application:', error)
      });
    }
  }

  viewDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/applications', id]);
    }
  }

  getStatusClass(status: ApplicationStatus): string {
    return status.toLowerCase();
  }

  logout(): void {
    this.authService.logout();
  }

  private getEmptyApplication(): Application {
    return {
      company: '',
      position: '',
      status: ApplicationStatus.WISHLIST,
      location: '',
      salary: '',
      jobUrl: '',
      contactPerson: '',
      contactEmail: '',
      notes: [],
      reminders: []
    };
  }
}
