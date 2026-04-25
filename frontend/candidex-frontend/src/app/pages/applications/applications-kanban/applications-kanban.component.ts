import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { ApplicationsService } from '../../../features/applications/services/applications.service';
import { CompanySuggestionService } from '../../../features/applications/services/company-suggestion.service';
import { Application, ApplicationStatus, ApplicationStatusLabels, ApplicationSourceLabels } from '../../../features/applications/models';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApplicationFormComponent } from '../../../features/applications/components/application-form/application-form.component';

interface KanbanColumn {
  status: ApplicationStatus;
  label: string;
  applications: Application[];
  color: string;
}

@Component({
  selector: 'app-applications-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './applications-kanban.component.html',
  styleUrl: './applications-kanban.component.scss'
})
export class ApplicationsKanbanComponent implements OnInit {
  
  columns: KanbanColumn[] = [
    { status: ApplicationStatus.APPLIED, label: ApplicationStatusLabels[ApplicationStatus.APPLIED], applications: [], color: '#2196F3' },
    { status: ApplicationStatus.HR_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.HR_INTERVIEW], applications: [], color: '#FF9800' },
    { status: ApplicationStatus.TECH_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.TECH_INTERVIEW], applications: [], color: '#9C27B0' },
    { status: ApplicationStatus.OFFER, label: ApplicationStatusLabels[ApplicationStatus.OFFER], applications: [], color: '#4CAF50' },
    { status: ApplicationStatus.OFFER_ACCEPTED, label: ApplicationStatusLabels[ApplicationStatus.OFFER_ACCEPTED], applications: [], color: '#2E7D32' },
    { status: ApplicationStatus.OFFER_DECLINED, label: ApplicationStatusLabels[ApplicationStatus.OFFER_DECLINED], applications: [], color: '#D84315' },
    { status: ApplicationStatus.REJECTED, label: ApplicationStatusLabels[ApplicationStatus.REJECTED], applications: [], color: '#fc1100' },
    { status: ApplicationStatus.GHOSTED, label: ApplicationStatusLabels[ApplicationStatus.GHOSTED], applications: [], color: '#9E9E9E' }
  ];
  
  loading = false;
  sourceLabels = ApplicationSourceLabels;
  selectedApplicationIds = new Set<string>();
  
  private httpErrorService = inject(HttpErrorService);
  private notificationService = inject(NotificationService);
  private companySuggestionService = inject(CompanySuggestionService);
  
  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadApplications();
  }
  
  loadApplications(): void {
    this.loading = true;
    this.applicationsService.getAll({ page: 1, size: 100, sort: 'updatedAt,desc' }).subscribe({
      next: (response) => {
        // Reset columns
        this.columns.forEach(col => col.applications = []);
        
        // Distribute applications into columns
        response.items.forEach(app => {
          const column = this.columns.find(col => col.status === app.status);
          if (column) {
            column.applications.push(app);
          }
        });

        this.pruneSelection();
        
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'le chargement du pipeline',
            'Impossible de charger le pipeline des candidatures.'
          )
        );
        this.loading = false;
      }
    });
  }
  
  drop(event: CdkDragDrop<Application[]>, targetColumn: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      // Reorder within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move to different column
      const application = event.previousContainer.data[event.previousIndex];
      
      // Update status in backend
      this.applicationsService.update(application.id, { status: targetColumn.status }).subscribe({
        next: () => {
          // Update UI
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.notificationService.success(`Statut mis à jour: ${targetColumn.label}`);
        },
        error: (error) => {
          this.notificationService.error(
            this.httpErrorService.getActionMessage(
              error,
              'la mise à jour du statut',
              'Échec de la mise à jour du statut. Veuillez réessayer.'
            )
          );
        }
      });
    }
  }
  
  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }
  
  editApplication(application: Application, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const dialogRef = this.dialog.open(ApplicationFormComponent, {
      width: '600px',
      autoFocus: false,
      disableClose: false,
      data: { application }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.success('Candidature mise à jour avec succès !');
        this.loadApplications();
      }
    });
  }
  
  changeStatus(application: Application, newStatus: ApplicationStatus, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.applicationsService.update(application.id, { status: newStatus }).subscribe({
      next: () => {
        this.notificationService.success('Statut mis à jour !');
        this.loadApplications();
      },
      error: (error) => {
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'la mise à jour de la candidature',
            'Échec de la mise à jour. Veuillez réessayer.'
          )
        );
      }
    });
  }

  getLocationDisplay(app: Application): string | null {
    const city = (app.city || '').trim();
    const country = (app.country || '').trim();

    if (city && country) {
      return `${city}, ${country}`;
    }

    return city || country || null;
  }

  getCompanyLogoUrl(app: Application): string {
    return this.companySuggestionService.getLogoUrl(app.companyDomain);
  }
  
  getColumnIds(): string[] {
    return this.columns.map(col => col.status);
  }

  getSelectedCount(): number {
    return this.selectedApplicationIds.size;
  }

  isSelected(applicationId: string): boolean {
    return this.selectedApplicationIds.has(applicationId);
  }

  toggleSelection(applicationId: string, event?: Event): void {
    event?.stopPropagation();

    if (this.selectedApplicationIds.has(applicationId)) {
      this.selectedApplicationIds.delete(applicationId);
      return;
    }

    this.selectedApplicationIds.add(applicationId);
  }

  clearSelection(): void {
    this.selectedApplicationIds.clear();
  }

  hasSelection(): boolean {
    return this.selectedApplicationIds.size > 0;
  }

  countSelectedInColumn(column: KanbanColumn): number {
    return column.applications.filter(app => this.selectedApplicationIds.has(app.id)).length;
  }

  isColumnFullySelected(column: KanbanColumn): boolean {
    return column.applications.length > 0 && column.applications.every(app => this.selectedApplicationIds.has(app.id));
  }

  toggleColumnSelection(column: KanbanColumn, event?: Event): void {
    event?.stopPropagation();

    if (this.isColumnFullySelected(column)) {
      column.applications.forEach(app => this.selectedApplicationIds.delete(app.id));
      return;
    }

    column.applications.forEach(app => this.selectedApplicationIds.add(app.id));
  }

  applyBatchStatus(status: ApplicationStatus): void {
    const selectedApplications = this.columns
      .flatMap(column => column.applications)
      .filter(app => this.selectedApplicationIds.has(app.id) && app.status !== status);

    if (selectedApplications.length === 0) {
      this.notificationService.info('Aucune candidature sélectionnée à déplacer.');
      return;
    }

    this.loading = true;
    this.applicationsService.updateStatuses({
      ids: selectedApplications.map(app => app.id),
      status
    }).subscribe({
      next: () => {
        this.notificationService.success(
          `${selectedApplications.length} candidature${selectedApplications.length > 1 ? 's' : ''} déplacée${selectedApplications.length > 1 ? 's' : ''} vers ${this.getColumnLabel(status)}.`
        );
        this.clearSelection();
        this.loadApplications();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'la mise à jour groupée des candidatures',
            'Impossible de mettre à jour les candidatures sélectionnées.'
          )
        );
      }
    });
  }

  private getColumnLabel(status: ApplicationStatus): string {
    return this.columns.find(column => column.status === status)?.label || status;
  }

  private pruneSelection(): void {
    const ids = new Set(this.columns.flatMap(column => column.applications).map(app => app.id));
    this.selectedApplicationIds.forEach(id => {
      if (!ids.has(id)) {
        this.selectedApplicationIds.delete(id);
      }
    });
  }
}
