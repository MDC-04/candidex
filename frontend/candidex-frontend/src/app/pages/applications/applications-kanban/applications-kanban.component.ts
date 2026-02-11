import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { ApplicationsService } from '../../../features/applications/services/applications.service';
import { Application, ApplicationStatus, ApplicationStatusLabels, ApplicationSourceLabels } from '../../../features/applications/models';

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
    MatProgressSpinnerModule
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
    { status: ApplicationStatus.REJECTED, label: ApplicationStatusLabels[ApplicationStatus.REJECTED], applications: [], color: '#F44336' },
    { status: ApplicationStatus.GHOSTED, label: ApplicationStatusLabels[ApplicationStatus.GHOSTED], applications: [], color: '#9E9E9E' }
  ];
  
  loading = false;
  sourceLabels = ApplicationSourceLabels;
  
  constructor(
    private applicationsService: ApplicationsService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadApplications();
  }
  
  loadApplications(): void {
    this.loading = true;
    this.applicationsService.getAll().subscribe({
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
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load applications:', error);
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
        },
        error: (error) => {
          console.error('Failed to update application status:', error);
        }
      });
    }
  }
  
  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }
  
  getColumnIds(): string[] {
    return this.columns.map(col => col.status);
  }
}
