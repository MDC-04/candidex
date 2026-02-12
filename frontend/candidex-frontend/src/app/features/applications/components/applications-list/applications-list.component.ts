import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

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
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
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
    'actions'
  ];

  /**
   * Expose enum labels to template
   */
  statusLabels = ApplicationStatusLabels;
  sourceLabels = ApplicationSourceLabels;

  private notificationService = inject(NotificationService);

  constructor(
    private applicationsService: ApplicationsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load all applications on component initialization
    this.loadApplications();
  }

  /**
   * Load applications from the service
   */
  loadApplications(): void {
    this.applications$ = this.applicationsService.getAll();
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
