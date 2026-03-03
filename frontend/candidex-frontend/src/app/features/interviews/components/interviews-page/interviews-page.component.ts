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
import { PrepPackDialogComponent } from '../prep-pack-dialog/prep-pack-dialog.component';
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
    MatMenuModule
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
      case InterviewType.HR:         return '#e3f2fd';  // bleu clair
      case InterviewType.TECH:       return '#f3e5f5';  // violet clair
      case InterviewType.MANAGER:    return '#fff3e0';  // ambre clair
      case InterviewType.TAKE_HOME:  return '#e8f5e9';  // vert clair
      case InterviewType.OTHER:      return '#eceff1';  // gris clair
      default:                       return '#e3f2fd';
    }
  }

  getTypeTextColor(type: InterviewType): string {
    switch (type) {
      case InterviewType.HR:         return '#1565c0';  // bleu foncé
      case InterviewType.TECH:       return '#7b1fa2';  // violet foncé
      case InterviewType.MANAGER:    return '#e65100';  // ambre foncé
      case InterviewType.TAKE_HOME:  return '#2e7d32';  // vert foncé
      case InterviewType.OTHER:      return '#546e7a';  // gris foncé
      default:                       return '#1565c0';
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
          this.loadInterviews();
        },
        error: () => this.notificationService.error('Erreur lors de la suppression')
      });
    });
  }

  // Prep pack drawer
  openPrepPack(interview: Interview): void {
    const dialogRef = this.dialog.open(PrepPackDialogComponent, {
      width: '580px',
      maxHeight: '85vh',
      data: { interview }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const dto: UpdateInterviewDto = { notes: result.notes, feedback: result.feedback };
      this.interviewsService.update(interview.id, dto).subscribe({
        next: () => {
          this.notificationService.success('Notes sauvegardées');
          this.loadInterviews();
        },
        error: () => this.notificationService.error('Erreur')
      });
    });
  }

}
