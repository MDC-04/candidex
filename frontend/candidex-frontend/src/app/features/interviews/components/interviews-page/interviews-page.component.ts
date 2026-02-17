import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { InterviewsService } from '../../services/interviews.service';
import {
  Interview,
  InterviewStatus,
  InterviewType,
  InterviewTypeLabels,
  InterviewMode,
  InterviewModeLabels,
  InterviewStatusLabels,
  UpdateInterviewDto
} from '../../models';
import { InterviewFormDialogComponent } from '../interview-form-dialog/interview-form-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-interviews-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './interviews-page.component.html',
  styleUrl: './interviews-page.component.scss'
})
export class InterviewsPageComponent implements OnInit {

  loading = true;
  allInterviews: Interview[] = [];
  todayInterviews: Interview[] = [];
  next7DaysInterviews: Interview[] = [];
  upcomingInterviews: Interview[] = [];
  pastInterviews: Interview[] = [];

  // Prep pack drawer
  drawerOpen = false;
  selectedInterview: Interview | null = null;
  editingFeedback = '';
  editingNotes = '';

  private notificationService = inject(NotificationService);

  constructor(
    private interviewsService: InterviewsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.interviewsService.getAll().subscribe({
      next: (interviews) => {
        this.allInterviews = interviews;
        this.categorizeInterviews();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des entretiens');
        this.loading = false;
      }
    });
  }

  private categorizeInterviews(): void {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOf7Days = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.todayInterviews = [];
    this.next7DaysInterviews = [];
    this.upcomingInterviews = [];
    this.pastInterviews = [];

    for (const interview of this.allInterviews) {
      const startAt = new Date(interview.startAt);

      if (interview.status === InterviewStatus.DONE || interview.status === InterviewStatus.CANCELED || startAt < startOfToday) {
        this.pastInterviews.push(interview);
      } else if (startAt >= startOfToday && startAt < endOfToday) {
        this.todayInterviews.push(interview);
      } else if (startAt >= endOfToday && startAt < endOf7Days) {
        this.next7DaysInterviews.push(interview);
      } else {
        this.upcomingInterviews.push(interview);
      }
    }

    // Sort past descending
    this.pastInterviews.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }

  getTypeLabel(type: InterviewType): string {
    return InterviewTypeLabels[type];
  }

  getModeLabel(mode: InterviewMode): string {
    return InterviewModeLabels[mode];
  }

  getStatusLabel(status: InterviewStatus): string {
    return InterviewStatusLabels[status];
  }

  getModeIcon(mode: InterviewMode): string {
    switch (mode) {
      case InterviewMode.VIDEO: return 'videocam';
      case InterviewMode.ONSITE: return 'business';
      case InterviewMode.PHONE: return 'phone';
      default: return 'event';
    }
  }

  getTypeColor(type: InterviewType): string {
    switch (type) {
      case InterviewType.HR: return '#1565c0';
      case InterviewType.TECH: return '#e65100';
      case InterviewType.MANAGER: return '#6a1b9a';
      case InterviewType.TAKE_HOME: return '#2e7d32';
      case InterviewType.OTHER: return '#616161';
      default: return '#667eea';
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }

  // Actions
  markAsDone(interview: Interview): void {
    this.interviewsService.update(interview.id, { status: InterviewStatus.DONE }).subscribe({
      next: () => {
        this.notificationService.success('Entretien marqué comme terminé');
        this.loadInterviews();
      },
      error: () => this.notificationService.error('Erreur')
    });
  }

  cancelInterview(interview: Interview): void {
    this.interviewsService.update(interview.id, { status: InterviewStatus.CANCELED }).subscribe({
      next: () => {
        this.notificationService.success('Entretien annulé');
        this.loadInterviews();
      },
      error: () => this.notificationService.error('Erreur')
    });
  }

  editInterview(interview: Interview): void {
    const dialogRef = this.dialog.open(InterviewFormDialogComponent, {
      width: '600px',
      data: { interview }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadInterviews();
    });
  }

  deleteInterview(interview: Interview): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer l\'entretien',
        message: `Êtes-vous sûr de vouloir supprimer l'entretien "${interview.title}" prévu le ${this.formatDate(interview.startAt)} à ${this.formatTime(interview.startAt)} ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.interviewsService.delete(interview.id).subscribe({
        next: () => {
          this.notificationService.success('Entretien supprimé');
          if (this.selectedInterview?.id === interview.id) {
            this.closeDrawer();
          }
          this.loadInterviews();
        },
        error: () => this.notificationService.error('Erreur lors de la suppression')
      });
    });
  }

  // Prep pack drawer
  openPrepPack(interview: Interview): void {
    this.selectedInterview = interview;
    this.editingFeedback = interview.feedback || '';
    this.editingNotes = interview.notes || '';
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedInterview = null;
  }

  savePrepNotes(): void {
    if (!this.selectedInterview) return;
    const dto: UpdateInterviewDto = {
      notes: this.editingNotes,
      feedback: this.editingFeedback
    };
    this.interviewsService.update(this.selectedInterview.id, dto).subscribe({
      next: (updated) => {
        this.notificationService.success('Notes sauvegardées');
        this.selectedInterview = updated;
        this.loadInterviews();
      },
      error: () => this.notificationService.error('Erreur')
    });
  }
}
