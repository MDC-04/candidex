import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { ApplicationsService } from '../../services/applications.service';
import { Application, ApplicationStatusLabels, ApplicationSourceLabels } from '../../models';
import { ApplicationFormComponent } from '../application-form/application-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorService } from '../../../../core/services/http-error.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Component for displaying detailed view of a single application
 * 
 * Features:
 * - Displays all application information
 * - Shows related links
 * - Displays next action reminder
 * - Edit and delete actions
 */
@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  
  application$!: Observable<Application>;
  statusLabels = ApplicationStatusLabels;
  sourceLabels = ApplicationSourceLabels;
  
  private currentApplication?: Application;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationsService: ApplicationsService,
    private location: Location,
    private dialog: MatDialog,
    private httpErrorService: HttpErrorService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.application$ = this.applicationsService.getById(id);
      // Subscribe to store current application for edit/delete
      this.application$.subscribe({
        next: (app) => {
          this.currentApplication = app;
        },
        error: (error) => {
          this.notificationService.error(
            this.httpErrorService.getActionMessage(
              error,
              'le chargement de la candidature',
              'Impossible de charger cette candidature.'
            )
          );
        }
      });
    }
  }

  /**
   * Navigate back to list
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Open edit dialog
   */
  onEdit(): void {
    if (!this.currentApplication) return;

    const dialogRef = this.dialog.open(ApplicationFormComponent, {
      width: '600px',
      autoFocus: false,
      disableClose: false,
      data: { application: this.currentApplication }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Application updated, reload current application
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.application$ = this.applicationsService.getById(id);
          this.application$.subscribe(app => {
            this.currentApplication = app;
          });
        }
      }
    });
  }

  /**
   * Delete application with confirmation
   */
  onDelete(): void {
    if (!this.currentApplication) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Supprimer la candidature',
        message: `Êtes-vous sûr de vouloir supprimer la candidature pour "${this.currentApplication.roleTitle}" chez "${this.currentApplication.companyName}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.currentApplication) {
        this.applicationsService.delete(this.currentApplication.id).subscribe({
          next: () => {
            this.notificationService.success('Candidature supprimée avec succès !');
            // Navigate back to list after successful deletion
            this.router.navigate(['/applications']);
          },
          error: (err) => {
            this.notificationService.error(
              this.httpErrorService.getActionMessage(
                err,
                'la suppression de la candidature',
                'Échec de la suppression. Veuillez réessayer.'
              )
            );
          }
        });
      }
    });
  }

  /**
   * Get status label
   */
  getStatusLabel(app: Application): string {
    return ApplicationStatusLabels[app.status];
  }

  /**
   * Get source label
   */
  getSourceLabel(app: Application): string {
    return ApplicationSourceLabels[app.source];
  }

  getLocationDisplay(app: Application): string {
    const city = (app.city || '').trim();
    const country = (app.country || '').trim();

    if (city && country) {
      return `${city}, ${country}`;
    }
    return city || country || 'N/A';
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'APPLIED': 'status-applied',
      'HR_INTERVIEW': 'status-interview',
      'TECH_INTERVIEW': 'status-interview',
      'OFFER': 'status-offer',
      'OFFER_ACCEPTED': 'status-offer-accepted',
      'OFFER_DECLINED': 'status-offer-declined',
      'REJECTED': 'status-rejected',
      'GHOSTED': 'status-ghosted'
    };
    return classes[status] || '';
  }
}
