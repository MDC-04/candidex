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
import { HttpErrorService } from '../../../../core/services/http-error.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type InterviewsViewMode = 'agenda' | 'calendar';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  interviews: Interview[];
}

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

  viewMode: InterviewsViewMode = 'agenda';
  localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  calendarMonth = this.getStartOfMonth(new Date());
  calendarDays: CalendarDay[] = [];
  weekDayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  private httpErrorService = inject(HttpErrorService);
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
        this.allInterviews = [...interviews].sort((a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        );
        this.categorizeInterviews();
        this.buildCalendar();
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'le chargement des entretiens',
            'Impossible de charger les entretiens.'
          )
        );
        this.loading = false;
      }
    });
  }

  setViewMode(mode: InterviewsViewMode): void {
    this.viewMode = mode;
    if (mode === 'calendar') {
      this.buildCalendar();
    }
  }

  goToPreviousMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  goToNextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  resetToCurrentMonth(): void {
    this.calendarMonth = this.getStartOfMonth(new Date());
    this.buildCalendar();
  }

  getCalendarMonthLabel(): string {
    const label = this.calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  getInterviewTimezone(interview: Interview): string {
    return (interview.timezone || '').trim() || this.localTimezone;
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
      case InterviewType.HR:         return '#e3f2fd';
      case InterviewType.TECH:       return '#f3e5f5';
      case InterviewType.MANAGER:    return '#fff3e0';
      case InterviewType.TAKE_HOME:  return '#e8f5e9';
      case InterviewType.OTHER:      return '#eceff1';
      default:                       return '#e3f2fd';
    }
  }

  getTypeTextColor(type: InterviewType): string {
    switch (type) {
      case InterviewType.HR:         return '#1565c0';
      case InterviewType.TECH:       return '#7b1fa2';
      case InterviewType.MANAGER:    return '#e65100';
      case InterviewType.TAKE_HOME:  return '#2e7d32';
      case InterviewType.OTHER:      return '#546e7a';
      default:                       return '#1565c0';
    }
  }

  formatDate(iso: string, timezone?: string): string {
    const date = new Date(iso);
    return this.toLocaleDateSafe(date, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: this.resolveTimezone(timezone)
    });
  }

  formatTime(iso: string, timezone?: string): string {
    const date = new Date(iso);
    return this.toLocaleTimeSafe(date, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.resolveTimezone(timezone)
    });
  }

  // Actions
  markAsDone(interview: Interview): void {
    this.interviewsService.update(interview.id, { status: InterviewStatus.DONE }).subscribe({
      next: () => {
        this.notificationService.success('Entretien marqué comme terminé');
        this.loadInterviews();
      },
      error: (error) => this.notificationService.error(
        this.httpErrorService.getActionMessage(
          error,
          'la mise à jour de l\'entretien',
          'Échec de la mise à jour de l\'entretien.'
        )
      )
    });
  }

  cancelInterview(interview: Interview): void {
    this.interviewsService.update(interview.id, { status: InterviewStatus.CANCELED }).subscribe({
      next: () => {
        this.notificationService.success('Entretien annulé');
        this.loadInterviews();
      },
      error: (error) => this.notificationService.error(
        this.httpErrorService.getActionMessage(
          error,
          'l\'annulation de l\'entretien',
          'Échec de l\'annulation de l\'entretien.'
        )
      )
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
    const timezone = this.getInterviewTimezone(interview);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer l\'entretien',
        message: `Êtes-vous sûr de vouloir supprimer l'entretien "${interview.title}" prévu le ${this.formatDate(interview.startAt, timezone)} à ${this.formatTime(interview.startAt, timezone)} ? Cette action est irréversible.`,
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
        error: (error) => this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'la suppression de l\'entretien',
            'Échec de la suppression de l\'entretien.'
          )
        )
      });
    });
  }

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
        error: (error) => this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'la sauvegarde des notes',
            'Échec de la sauvegarde des notes.'
          )
        )
      });
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

    this.pastInterviews.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }

  private buildCalendar(): void {
    const monthStart = this.getStartOfMonth(this.calendarMonth);
    const offset = (monthStart.getDay() + 6) % 7; // Monday-first
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - offset);

    const today = this.getStartOfDay(new Date());
    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      const normalized = this.getStartOfDay(day);

      this.calendarDays.push({
        date: normalized,
        inCurrentMonth: normalized.getMonth() === monthStart.getMonth(),
        isToday: normalized.getTime() === today.getTime(),
        interviews: this.getInterviewsForDay(normalized)
      });
    }
  }

  private getInterviewsForDay(day: Date): Interview[] {
    return this.allInterviews
      .filter((interview) => {
        const startAt = new Date(interview.startAt);
        return this.getStartOfDay(startAt).getTime() === day.getTime();
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  private resolveTimezone(timezone?: string): string {
    return (timezone || '').trim() || this.localTimezone;
  }

  private toLocaleDateSafe(date: Date, options: Intl.DateTimeFormatOptions): string {
    try {
      return date.toLocaleDateString('fr-FR', options);
    } catch {
      const fallback = { ...options };
      delete fallback.timeZone;
      return date.toLocaleDateString('fr-FR', fallback);
    }
  }

  private toLocaleTimeSafe(date: Date, options: Intl.DateTimeFormatOptions): string {
    try {
      return date.toLocaleTimeString('fr-FR', options);
    } catch {
      const fallback = { ...options };
      delete fallback.timeZone;
      return date.toLocaleTimeString('fr-FR', fallback);
    }
  }

  private getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
