import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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

import { ApplicationListParams, ApplicationsService, PaginatedApplications } from '../../services/applications.service';
import { 
  Application, 
  ApplicationStatus,
  ApplicationSource,
  ApplicationStatusLabels, 
  ApplicationSourceLabels 
} from '../../models';
import { ApplicationFormComponent } from '../application-form/application-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorService } from '../../../../core/services/http-error.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InterviewFormDialogComponent } from '../../../../features/interviews/components/interview-form-dialog/interview-form-dialog.component';

type SortableField = 'companyName' | 'roleTitle' | 'status' | 'source' | 'city' | 'appliedDate' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

/**
 * Component for displaying a list of job applications
 * 
 * Features:
 * - Displays applications in a Material table
 * - Shows status, source, company, role, city/country
 * - Responsive design (mobile-friendly)
 * - Uses async pipe for automatic subscription management
 */
@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
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
export class ApplicationsListComponent implements OnInit, OnDestroy {
  loading = false;
  data: PaginatedApplications | null = null;
  displayItems: Application[] = [];

  /**
   * Columns to display in the table
   */
  displayedColumns: string[] = [
    'companyName',
    'roleTitle',
    'status',
    'source',
    'localisation',
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
  statusFilterControl = new FormControl<ApplicationStatus | 'ALL'>('ALL');
  locationFilterControl = new FormControl('');
  sourceFilterControl = new FormControl<ApplicationSource | 'ALL'>('ALL');
  
  /**
   * Available filter options
   */
  statusOptions = ['ALL', ...Object.values(ApplicationStatus)];
  sourceOptions = ['ALL', ...Object.values(ApplicationSource)];
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50];
  sortField: SortableField = 'updatedAt';
  sortDirection: SortDirection = 'desc';

  readonly sortLabels: Record<SortableField, string> = {
    companyName: 'Entreprise',
    roleTitle: 'Poste',
    status: 'Statut',
    source: 'Source',
    city: 'Localisation',
    appliedDate: 'Date de candidature',
    updatedAt: 'Dernière mise à jour'
  };
  
  private httpErrorService = inject(HttpErrorService);
  private notificationService = inject(NotificationService);
  private readonly filterSubscriptions = new Subscription();
  private loadSubscription: Subscription | null = null;

  constructor(
    private applicationsService: ApplicationsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();

    // Text filters are debounced and triggered from 2 chars to avoid noisy refreshes.
    this.filterSubscriptions.add(
      this.searchControl.valueChanges
        .pipe(
          map(value => (value || '').trim()),
          debounceTime(700),
          distinctUntilChanged(),
          filter(value => value.length === 0 || value.length >= 2)
        )
        .subscribe(() => this.resetAndLoadApplications())
    );

    this.filterSubscriptions.add(
      this.locationFilterControl.valueChanges
        .pipe(
          map(value => (value || '').trim()),
          debounceTime(700),
          distinctUntilChanged(),
          filter(value => value.length === 0 || value.length >= 2)
        )
        .subscribe(() => this.resetAndLoadApplications())
    );

    // Select filters can query immediately.
    this.filterSubscriptions.add(
      this.statusFilterControl.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.resetAndLoadApplications())
    );

    this.filterSubscriptions.add(
      this.sourceFilterControl.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(() => this.resetAndLoadApplications())
    );
  }

  ngOnDestroy(): void {
    this.filterSubscriptions.unsubscribe();
    this.loadSubscription?.unsubscribe();
  }

  /**
   * Load applications from the service
   */
  loadApplications(): void {
    const params = this.buildQueryParams();

    this.loadSubscription?.unsubscribe();
    this.loading = true;

    this.loadSubscription = this.applicationsService.getAll(params).subscribe({
      next: (data) => {
        this.data = data;
        this.displayItems = this.applyLocalSafetyFilters(data.items);

        if (data.totalPages > 0 && this.pageIndex > data.totalPages - 1) {
          this.pageIndex = data.totalPages - 1;
          this.loadApplications();
          return;
        }

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.displayItems = [];
        this.data = {
          items: [],
          page: 1,
          size: this.pageSize,
          totalItems: 0,
          totalPages: 0
        };

        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'le chargement des candidatures',
            'Impossible de charger la liste des candidatures.'
          )
        );
      }
    });
  }

  private applyLocalSafetyFilters(items: Application[]): Application[] {
    const searchTerm = (this.searchControl.value || '').trim().toLowerCase();
    const locationTerm = (this.locationFilterControl.value || '').trim().toLowerCase();
    const statusFilter = this.statusFilterControl.value;
    const sourceFilter = this.sourceFilterControl.value;

    return items.filter((app) => {
      if (statusFilter && statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }

      if (sourceFilter && sourceFilter !== 'ALL' && app.source !== sourceFilter) {
        return false;
      }

      if (searchTerm.length >= 2) {
        const searchable = `${app.companyName} ${app.roleTitle} ${app.notes || ''}`.toLowerCase();
        if (!searchable.includes(searchTerm)) {
          return false;
        }
      }

      if (locationTerm.length >= 2) {
        const searchableLocation = `${app.city || ''} ${app.country || ''}`.toLowerCase();
        if (!searchableLocation.includes(locationTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.isEffectiveTextFilter(this.searchControl.value) ||
      this.isEffectiveTextFilter(this.locationFilterControl.value) ||
      this.statusFilterControl.value !== 'ALL' ||
      this.sourceFilterControl.value !== 'ALL'
    );
  }

  private isEffectiveTextFilter(value: string | null): boolean {
    return (value || '').trim().length >= 2;
  }

  private buildQueryParams(): ApplicationListParams {
    const params: ApplicationListParams = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDirection}`
    };

    const searchTerm = (this.searchControl.value || '').trim();
    const locationTerm = (this.locationFilterControl.value || '').trim();
    const statusFilter = this.statusFilterControl.value;
    const sourceFilter = this.sourceFilterControl.value;

    if (searchTerm) {
      if (searchTerm.length >= 2) {
        params.q = searchTerm;
      }
    }

    if (locationTerm) {
      if (locationTerm.length >= 2) {
        params.location = locationTerm;
      }
    }

    if (statusFilter && statusFilter !== 'ALL') {
      params.status = statusFilter;
    }

    if (sourceFilter && sourceFilter !== 'ALL') {
      params.source = sourceFilter;
    }

    return params;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusFilterControl.setValue('ALL', { emitEvent: false });
    this.locationFilterControl.setValue('', { emitEvent: false });
    this.sourceFilterControl.setValue('ALL', { emitEvent: false });
    this.resetAndLoadApplications();
  }

  onSort(field: SortableField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = field === 'companyName' || field === 'roleTitle' || field === 'city' ? 'asc' : 'desc';
    }

    this.resetAndLoadApplications();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadApplications();
  }

  isSortActive(field: SortableField): boolean {
    return this.sortField === field;
  }

  getSortIcon(field: SortableField): string {
    if (!this.isSortActive(field)) {
      return 'unfold_more';
    }

    return this.sortDirection === 'asc' ? 'north' : 'south';
  }

  getSortAriaLabel(field: SortableField): string {
    const label = this.sortLabels[field];

    if (!this.isSortActive(field)) {
      return `Trier par ${label}`;
    }

    return `Trier par ${label} en ordre ${this.sortDirection === 'asc' ? 'décroissant' : 'croissant'}`;
  }

  getResultsStart(): number {
    if (!this.data?.totalItems) {
      return 0;
    }

    return this.pageIndex * this.pageSize + 1;
  }

  getResultsEnd(): number {
    if (!this.data?.totalItems) {
      return 0;
    }

    return Math.min(this.pageIndex * this.pageSize + this.displayItems.length, this.data.totalItems);
  }

  private resetAndLoadApplications(): void {
    this.pageIndex = 0;
    this.loadApplications();
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
      autoFocus: false,
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

  getLocationDisplay(app: Application): string {
    const city = (app.city || '').trim();
    const country = (app.country || '').trim();

    if (city && country) {
      return `${city}, ${country}`;
    }
    return city || country || 'Non spécifié';
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
      'OFFER_ACCEPTED': 'status-offer-accepted',
      'OFFER_DECLINED': 'status-offer-declined',
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
      return this.getSuggestedNextActionInfo(app.status);
    }
    
    const action = app.nextAction;
    if (action.done) {
      return { text: 'Complété', icon: 'done', class: 'next-action-done' };
    }
    
    // Check if overdue
    const actionDate = new Date(action.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    actionDate.setHours(0, 0, 0, 0);

    const isValidDate = !Number.isNaN(actionDate.getTime());
    const isOverdue = isValidDate && actionDate < today;
    const fallbackText = isValidDate
      ? `Action prévue le ${actionDate.toLocaleDateString('fr-FR')}`
      : 'Action prévue';
    
    return {
      text: action.note?.trim() || fallbackText,
      icon: isOverdue ? 'warning' : 'schedule',
      class: isOverdue ? 'next-action-overdue' : 'next-action-scheduled'
    };
  }

  private getSuggestedNextActionInfo(status: ApplicationStatus): { text: string; icon: string; class: string } | null {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return { text: 'Relancer sous 7 jours', icon: 'send', class: 'next-action-followup' };
      case ApplicationStatus.HR_INTERVIEW:
      case ApplicationStatus.TECH_INTERVIEW:
        return { text: 'Préparer l\'entretien', icon: 'event', class: 'next-action-interview' };
      case ApplicationStatus.OFFER:
        return { text: 'Répondre à l\'offre', icon: 'check_circle', class: 'next-action-respond' };
      case ApplicationStatus.OFFER_ACCEPTED:
        return { text: 'Onboarding à préparer', icon: 'celebration', class: 'next-action-accepted' };
      case ApplicationStatus.OFFER_DECLINED:
        return { text: 'Suivi clôturé', icon: 'close', class: 'next-action-none' };
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.GHOSTED:
        return { text: 'Clôturer le suivi', icon: 'inventory_2', class: 'next-action-none' };
      default:
        return null;
    }
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
      autoFocus: false,
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
   * Schedule an interview for the given application
   */
  onScheduleInterview(application: Application): void {
    const dialogRef = this.dialog.open(InterviewFormDialogComponent, {
      width: '600px',
      data: {
        applicationId: application.id,
        applicationTitle: `${application.roleTitle} – ${application.companyName}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.success('Entretien planifié avec succès !');
      }
    });
  }

  /**
   * Navigate to interviews page filtered by application
   */
  onViewInterviews(application: Application): void {
    this.router.navigate(['/interviews'], {
      queryParams: { applicationId: application.id }
    });
  }
}
