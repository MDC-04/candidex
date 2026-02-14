import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { ApplicationsService, PaginatedApplications } from '../../services/applications.service';
import { 
  Application, 
  ApplicationStatus,
  ApplicationSource,
  ApplicationStatusLabels, 
  ApplicationSourceLabels 
} from '../../models';
import { ApplicationFormComponent } from '../application-form/application-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Component for displaying a list of job applications
 * 
 * Features:
 * - Displays applications in a Material table
 * - Shows status, source, company, role, location
 * - Responsive design (mobile-friendly)
 * - Uses async pipe for automatic subscription management
 */
@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './applications-list.component.html',
  styleUrl: './applications-list.component.scss'
})
export class ApplicationsListComponent implements OnInit {
  
  /**
   * Observable stream of applications data
   * Will be consumed by async pipe in template
   */
  applications$!: Observable<PaginatedApplications>;
  filteredApplications$!: Observable<Application[]>;

  /**
   * Columns to display in the table
   */
  displayedColumns: string[] = [
    'companyName',
    'roleTitle',
    'status',
    'source',
    'location',
    'appliedDate',
    'nextAction',
    'actions'
  ];

  /**
   * Expose enum labels to template
   */
  statusLabels = ApplicationStatusLabels;
  sourceLabels = ApplicationSourceLabels;
  
  /**
   * Filter controls
   */
  searchControl = new FormControl('');
  // statusFilterControl removed in favor of location-based filtering
  locationFilterControl = new FormControl('');
  sourceFilterControl = new FormControl<ApplicationSource | 'ALL'>('ALL');
  
  /**
   * Available filter options
   */
  statusOptions = ['ALL', ...Object.values(ApplicationStatus)];
  sourceOptions = ['ALL', ...Object.values(ApplicationSource)];
  
  /**
   * Unfiltered applications for filtering
   */
  private allApplications: Application[] = [];

  private notificationService = inject(NotificationService);

  constructor(
    private applicationsService: ApplicationsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load all applications on component initialization
    this.loadApplications();
    
    // Subscribe to filter changes
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.locationFilterControl.valueChanges.subscribe(() => this.applyFilters());
    this.sourceFilterControl.valueChanges.subscribe(() => this.applyFilters());
  }

  /**
   * Load applications from the service
   */
  loadApplications(): void {
    this.applications$ = this.applicationsService.getAll();
    this.applications$.subscribe(data => {
      this.allApplications = data.items;
      this.applyFilters();
    });
  }
  
  /**
   * Apply filters to applications list
   */
  private applyFilters(): void {
    let filtered = [...this.allApplications];
    
    // Search filter (company or role)
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.companyName.toLowerCase().includes(searchTerm) ||
        app.roleTitle.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    // Location filter (city / location)
    const locationFilter = this.locationFilterControl.value?.toLowerCase() || '';
    if (locationFilter) {
      filtered = filtered.filter(app => (app.location || '').toLowerCase().includes(locationFilter));
    }
    
    // Source filter
    const sourceFilter = this.sourceFilterControl.value;
    if (sourceFilter && sourceFilter !== 'ALL') {
      filtered = filtered.filter(app => app.source === sourceFilter);
    }
    
    this.filteredApplications$ = new Observable(observer => {
      observer.next(filtered);
      observer.complete();
    });
  }
  
  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.locationFilterControl.setValue('');
    this.sourceFilterControl.setValue('ALL');
  }
  
  /**
   * Get filter label for display
   */
  getFilterLabel(value: string): string {
    if (value === 'ALL') return 'Tous';
    if (value in ApplicationStatusLabels) return ApplicationStatusLabels[value as ApplicationStatus];
    if (value in ApplicationSourceLabels) return ApplicationSourceLabels[value as ApplicationSource];
    return value;
  }

  /**
   * Open dialog to create a new application
   */
  onCreateNew(): void {
    const dialogRef = this.dialog.open(ApplicationFormComponent, {
      width: '600px',
      disableClose: false,
      data: { application: undefined } // Create mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Application created, reload list
        this.notificationService.success('Candidature créée avec succès !');
        this.loadApplications();
      }
    });
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: ApplicationStatus): string {
    return ApplicationStatusLabels[status];
  }

  /**
   * Get source label for display
   */
  getSourceLabel(source: ApplicationSource): string {
    return ApplicationSourceLabels[source];
  }

  /**
   * Get CSS class for status chip
   */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'APPLIED': 'status-applied',
      'HR_INTERVIEW': 'status-interview',
      'TECH_INTERVIEW': 'status-interview',
      'OFFER': 'status-offer',
      'REJECTED': 'status-rejected',
      'GHOSTED': 'status-ghosted'
    };
    return classes[status] || '';
  }
  
  /**
   * Get next action display info
   */
  getNextActionInfo(app: Application): { text: string; icon: string; class: string } | null {
    if (!app.nextAction) {
      // Mock next actions based on status for demo
      switch (app.status) {
        case ApplicationStatus.APPLIED:
          return { text: 'Relance', icon: 'send', class: 'next-action-followup' };
        case ApplicationStatus.HR_INTERVIEW:
        case ApplicationStatus.TECH_INTERVIEW:
          return { text: 'Entretien prévu', icon: 'event', class: 'next-action-interview' };
        case ApplicationStatus.OFFER:
          return { text: 'Répondre à l\'offre', icon: 'check_circle', class: 'next-action-respond' };
        case ApplicationStatus.REJECTED:
        case ApplicationStatus.GHOSTED:
          return { text: 'Sans réponse', icon: 'remove_circle', class: 'next-action-none' };
        default:
          return null;
      }
    }
    
    const action = app.nextAction;
    if (action.done) {
      return { text: 'Complété', icon: 'done', class: 'next-action-done' };
    }
    
    // Check if overdue
    const actionDate = new Date(action.date);
    const today = new Date();
    const isOverdue = actionDate < today;
    
    return {
      text: action.note || 'Action prévue',
      icon: isOverdue ? 'warning' : 'schedule',
      class: isOverdue ? 'next-action-overdue' : 'next-action-scheduled'
    };
  }

  /**
   * Handle view details action - Navigate to detail page
   */
  onViewDetails(application: Application): void {
    this.router.navigate(['/applications', application.id]);
  }

  /**
   * Handle edit action - Opens edit dialog
   */
  onEdit(application: Application): void {
    const dialogRef = this.dialog.open(ApplicationFormComponent, {
      width: '600px',
      disableClose: false,
      data: { application } // Edit mode - pass existing application
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Application updated, reload list
        this.notificationService.success('Candidature mise à jour avec succès !');
        this.loadApplications();
      }
    });
  }

  /**
   * Handle delete action - Opens confirmation dialog
   */
  onDelete(application: Application): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Supprimer la candidature',
        message: `Êtes-vous sûr de vouloir supprimer la candidature pour "${application.roleTitle}" chez "${application.companyName}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // User confirmed deletion
        this.applicationsService.delete(application.id).subscribe({
          next: () => {
            this.notificationService.success('Candidature supprimée avec succès !');
            this.loadApplications(); // Reload list
          },
          error: (err) => {
            this.notificationService.error('Échec de la suppression. Veuillez réessayer.');
          }
        });
      }
    });
  }
}
