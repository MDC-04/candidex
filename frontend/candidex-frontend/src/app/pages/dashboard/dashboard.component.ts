import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApplicationsService } from '../../features/applications/services/applications.service';
import { CompanySuggestionService } from '../../features/applications/services/company-suggestion.service';
import { Application, ApplicationStatus, ApplicationStatusLabels } from '../../features/applications/models';
import { HttpErrorService } from '../../core/services/http-error.service';
import { NotificationService } from '../../core/services/notification.service';

interface StatusStats {
  status: ApplicationStatus;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

interface DashboardStats {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  acceptedOffers: number;
  declinedOffers: number;
  rejected: number;
  responseRate: number;
}

interface TimelineEvent {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'offerAccepted' | 'offerDeclined' | 'rejection';
  companyName: string;
  roleTitle: string;
  date: Date;
  icon: string;
  color: string;
}

interface WeeklyData {
  week: string;
  applications: number;
  responses: number;
}

interface NextActionItem {
  id: string;
  companyName: string;
  companyDomain?: string;
  roleTitle: string;
  status: ApplicationStatus;
  label: string;
  helperText: string;
  icon: string;
  tone: 'overdue' | 'today' | 'upcoming' | 'suggested';
  priority: number;
  note?: string;
  sortDate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  loading = false;
  stats: DashboardStats = {
    total: 0,
    applied: 0,
    interviewing: 0,
    offers: 0,
    acceptedOffers: 0,
    declinedOffers: 0,
    rejected: 0,
    responseRate: 0
  };
  
  statusStats: StatusStats[] = [];
  recentApplications: Application[] = [];
  timelineEvents: TimelineEvent[] = [];
  weeklyData: WeeklyData[] = [];
  maxWeeklyApplications = 0;
  nextActionItems: NextActionItem[] = [];
  overdueActionCount = 0;
  todayActionCount = 0;
  
  constructor(
    private applicationsService: ApplicationsService,
    private companySuggestionService: CompanySuggestionService,
    private router: Router,
    private httpErrorService: HttpErrorService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.loading = true;
    this.applicationsService.getAll({ size: 100 }).subscribe({
      next: (response) => {
        this.calculateStats(response.items);
        this.generateNextActionItems(response.items);
        this.recentApplications = response.items
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        this.generateTimelineEvents(response.items);
        this.generateWeeklyData(response.items);
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(
          this.httpErrorService.getActionMessage(
            error,
            'le chargement du tableau de bord',
            'Impossible de charger le tableau de bord.'
          )
        );
        this.loading = false;
      }
    });
  }
  
  calculateStats(applications: Application[]): void {
    this.stats.total = applications.length;
    
    const statusCounts = new Map<ApplicationStatus, number>();
    applications.forEach(app => {
      statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1);
    });
    
    this.stats.applied = statusCounts.get(ApplicationStatus.APPLIED) || 0;
    this.stats.interviewing = 
      (statusCounts.get(ApplicationStatus.HR_INTERVIEW) || 0) +
      (statusCounts.get(ApplicationStatus.TECH_INTERVIEW) || 0);
    this.stats.offers = 
      (statusCounts.get(ApplicationStatus.OFFER) || 0) +
      (statusCounts.get(ApplicationStatus.OFFER_ACCEPTED) || 0) +
      (statusCounts.get(ApplicationStatus.OFFER_DECLINED) || 0);
    this.stats.acceptedOffers = statusCounts.get(ApplicationStatus.OFFER_ACCEPTED) || 0;
    this.stats.declinedOffers = statusCounts.get(ApplicationStatus.OFFER_DECLINED) || 0;
    this.stats.rejected = 
      (statusCounts.get(ApplicationStatus.REJECTED) || 0) +
      (statusCounts.get(ApplicationStatus.GHOSTED) || 0);
    
    // Response rate: (interviews + offers) / (total - ghosted)
    const ghosted = statusCounts.get(ApplicationStatus.GHOSTED) || 0;
    const denominator = this.stats.total - ghosted;
    this.stats.responseRate = denominator > 0 
      ? Math.round(((this.stats.interviewing + this.stats.offers) / denominator) * 100)
      : 0;
    
    // Status distribution
    this.statusStats = [
      { status: ApplicationStatus.APPLIED, label: ApplicationStatusLabels[ApplicationStatus.APPLIED], count: statusCounts.get(ApplicationStatus.APPLIED) || 0, color: '#2196F3', percentage: 0 },
      { status: ApplicationStatus.HR_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.HR_INTERVIEW], count: statusCounts.get(ApplicationStatus.HR_INTERVIEW) || 0, color: '#FF9800', percentage: 0 },
      { status: ApplicationStatus.TECH_INTERVIEW, label: ApplicationStatusLabels[ApplicationStatus.TECH_INTERVIEW], count: statusCounts.get(ApplicationStatus.TECH_INTERVIEW) || 0, color: '#9C27B0', percentage: 0 },
      { status: ApplicationStatus.OFFER, label: ApplicationStatusLabels[ApplicationStatus.OFFER], count: statusCounts.get(ApplicationStatus.OFFER) || 0, color: '#4CAF50', percentage: 0 },
      { status: ApplicationStatus.OFFER_ACCEPTED, label: ApplicationStatusLabels[ApplicationStatus.OFFER_ACCEPTED], count: statusCounts.get(ApplicationStatus.OFFER_ACCEPTED) || 0, color: '#2E7D32', percentage: 0 },
      { status: ApplicationStatus.OFFER_DECLINED, label: ApplicationStatusLabels[ApplicationStatus.OFFER_DECLINED], count: statusCounts.get(ApplicationStatus.OFFER_DECLINED) || 0, color: '#D84315', percentage: 0 },
      { status: ApplicationStatus.REJECTED, label: ApplicationStatusLabels[ApplicationStatus.REJECTED], count: statusCounts.get(ApplicationStatus.REJECTED) || 0, color: '#F44336', percentage: 0 },
      { status: ApplicationStatus.GHOSTED, label: ApplicationStatusLabels[ApplicationStatus.GHOSTED], count: statusCounts.get(ApplicationStatus.GHOSTED) || 0, color: '#9E9E9E', percentage: 0 }
    ];
    
    this.statusStats.forEach(stat => {
      stat.percentage = this.stats.total > 0 ? Math.round((stat.count / this.stats.total) * 100) : 0;
    });
  }
  
  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }
  
  goToApplications(): void {
    this.router.navigate(['/applications']);
  }
  
  getStatusLabel(status: ApplicationStatus): string {
    return ApplicationStatusLabels[status];
  }
  
  getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.APPLIED]: '#2196F3',
      [ApplicationStatus.HR_INTERVIEW]: '#FF9800',
      [ApplicationStatus.TECH_INTERVIEW]: '#9C27B0',
      [ApplicationStatus.OFFER]: '#4CAF50',
      [ApplicationStatus.OFFER_ACCEPTED]: '#2E7D32',
      [ApplicationStatus.OFFER_DECLINED]: '#D84315',
      [ApplicationStatus.REJECTED]: '#F44336',
      [ApplicationStatus.GHOSTED]: '#9E9E9E'
    };
    return colors[status];
  }

  getToneLabel(tone: NextActionItem['tone']): string {
    const labels: Record<NextActionItem['tone'], string> = {
      overdue: 'En retard',
      today: 'Aujourd’hui',
      upcoming: 'À venir',
      suggested: 'Suggestion'
    };

    return labels[tone];
  }

  getToneIcon(tone: NextActionItem['tone']): string {
    const icons: Record<NextActionItem['tone'], string> = {
      overdue: 'warning',
      today: 'today',
      upcoming: 'schedule',
      suggested: 'tips_and_updates'
    };

    return icons[tone];
  }

  getToneClass(tone: NextActionItem['tone']): string {
    return `tone-${tone}`;
  }
  
  private generateTimelineEvents(applications: Application[]): void {
    this.timelineEvents = [...applications]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(app => {
        let type: TimelineEvent['type'] = 'application';
        let icon = 'send';
        let color = '#2196F3';
        
        switch (app.status) {
          case ApplicationStatus.HR_INTERVIEW:
          case ApplicationStatus.TECH_INTERVIEW:
            type = 'interview';
            icon = 'event';
            color = '#FF9800';
            break;
          case ApplicationStatus.OFFER:
            type = 'offer';
            icon = 'star';
            color = '#4CAF50';
            break;
          case ApplicationStatus.OFFER_ACCEPTED:
            type = 'offerAccepted';
            icon = 'verified';
            color = '#2E7D32';
            break;
          case ApplicationStatus.OFFER_DECLINED:
            type = 'offerDeclined';
            icon = 'remove_circle';
            color = '#D84315';
            break;
          case ApplicationStatus.REJECTED:
          case ApplicationStatus.GHOSTED:
            type = 'rejection';
            icon = 'cancel';
            color = '#F44336';
            break;
        }
        
        return {
          id: app.id,
          type,
          companyName: app.companyName,
          roleTitle: app.roleTitle,
          date: new Date(app.updatedAt),
          icon,
          color
        };
      });
  }

  private generateNextActionItems(applications: Application[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prioritizedItems = applications
      .map(app => this.toNextActionItem(app, today))
      .filter((item): item is NextActionItem => item !== null)
      .sort((left, right) => left.priority - right.priority || left.sortDate - right.sortDate || left.companyName.localeCompare(right.companyName, 'fr'));

    this.nextActionItems = prioritizedItems.slice(0, 5);

    this.overdueActionCount = prioritizedItems.filter(item => item.tone === 'overdue').length;
    this.todayActionCount = prioritizedItems.filter(item => item.tone === 'today').length;
  }

  private toNextActionItem(app: Application, today: Date): NextActionItem | null {
    const base = { id: app.id, companyName: app.companyName, companyDomain: app.companyDomain, roleTitle: app.roleTitle, status: app.status };

    if (app.nextAction && !app.nextAction.done) {
      const actionDate = new Date(app.nextAction.date);
      const hasValidDate = !Number.isNaN(actionDate.getTime());

      if (!hasValidDate) {
        return null;
      }

      actionDate.setHours(0, 0, 0, 0);
      const dayDelta = this.getDayDelta(today, actionDate);
      const note = app.nextAction.note?.trim() || undefined;
      const statusPriorityOffset = this.getExplicitActionPriorityOffset(app.status);

      if (dayDelta < 0) {
        return {
          ...base,
          label: note || 'Action en retard',
          helperText: `Prévue le ${actionDate.toLocaleDateString('fr-FR')} • retard de ${Math.abs(dayDelta)} jour${Math.abs(dayDelta) > 1 ? 's' : ''}`,
          icon: 'notification_important',
          tone: 'overdue',
          priority: statusPriorityOffset,
          note,
          sortDate: actionDate.getTime()
        };
      }

      if (dayDelta === 0) {
        return {
          ...base,
          label: note || 'Action prévue aujourd’hui',
          helperText: 'À traiter aujourd’hui',
          icon: 'today',
          tone: 'today',
          priority: 10 + statusPriorityOffset,
          note,
          sortDate: actionDate.getTime()
        };
      }

      if (dayDelta > 7) {
        return null;
      }

      return {
        ...base,
        label: note || 'Action planifiée',
        helperText: dayDelta === 1
          ? 'Prévue demain'
          : `Prévue dans ${dayDelta} jours`,
        icon: 'schedule',
        tone: 'upcoming',
        priority: 20 + statusPriorityOffset + dayDelta,
        note,
        sortDate: actionDate.getTime()
      };
    }

    const suggestion = this.getSuggestedAction(app, today);
    if (!suggestion) {
      return null;
    }

    return {
      ...base,
      label: suggestion.label,
      helperText: suggestion.helperText,
      icon: suggestion.icon,
      tone: 'suggested',
      priority: suggestion.priority,
      sortDate: suggestion.sortDate
    };
  }

  private getSuggestedAction(app: Application, today: Date): { label: string; helperText: string; icon: string; priority: number; sortDate: number } | null {
    const updatedAt = this.toStartOfDay(new Date(app.updatedAt));
    const applicationDate = this.toStartOfDay(new Date(app.appliedDate || app.createdAt));
    const daysSinceUpdate = this.getDayDelta(updatedAt, today);
    const daysSinceApplication = this.getDayDelta(applicationDate, today);

    switch (app.status) {
      case ApplicationStatus.APPLIED:
        if (daysSinceApplication < 7 || daysSinceUpdate < 5) {
          return null;
        }

        return {
          label: 'Planifier une relance',
          helperText: `Candidature envoyée ${this.getRelativeTime(applicationDate).toLowerCase()} sans prochaine action`,
          icon: 'outgoing_mail',
          priority: daysSinceApplication >= 14 ? 40 : 55,
          sortDate: applicationDate.getTime()
        };
      case ApplicationStatus.HR_INTERVIEW:
      case ApplicationStatus.TECH_INTERVIEW:
        if (daysSinceUpdate > 10) {
          return null;
        }

        return {
          label: 'Préparer l’entretien',
          helperText: `Statut mis à jour ${this.getRelativeTime(updatedAt).toLowerCase()} • aucune action enregistrée`,
          icon: 'event_available',
          priority: 35,
          sortDate: updatedAt.getTime()
        };
      case ApplicationStatus.OFFER:
        if (daysSinceUpdate > 14) {
          return null;
        }

        return {
          label: 'Répondre à l’offre',
          helperText: `Offre reçue ${this.getRelativeTime(updatedAt).toLowerCase()} • aucune prochaine action`,
          icon: 'workspace_premium',
          priority: 30,
          sortDate: updatedAt.getTime()
        };
      case ApplicationStatus.OFFER_ACCEPTED:
      case ApplicationStatus.OFFER_DECLINED:
        return null;
      default:
        return null;
    }
  }

  private getExplicitActionPriorityOffset(status: ApplicationStatus): number {
    switch (status) {
      case ApplicationStatus.OFFER:
        return 0;
      case ApplicationStatus.OFFER_ACCEPTED:
      case ApplicationStatus.OFFER_DECLINED:
        return 8;
      case ApplicationStatus.HR_INTERVIEW:
      case ApplicationStatus.TECH_INTERVIEW:
        return 2;
      case ApplicationStatus.APPLIED:
        return 4;
      default:
        return 6;
    }
  }

  private getDayDelta(from: Date, to: Date): number {
    const diffMs = this.toStartOfDay(to).getTime() - this.toStartOfDay(from).getTime();
    return Math.round(diffMs / 86400000);
  }

  private toStartOfDay(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
  
  private generateWeeklyData(applications: Application[]): void {
    const currentWeekStart = this.getStartOfWeek(new Date());
    const weekStarts = Array.from({ length: 8 }, (_, index) => {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - (7 - index) * 7);
      return start;
    });

    const weeklyBuckets: WeeklyData[] = weekStarts.map((_, index) => ({
      week: index === 7 ? 'Cette semaine' : `S-${7 - index}`,
      applications: 0,
      responses: 0
    }));

    applications.forEach(app => {
      const applicationDate = app.appliedDate ? new Date(app.appliedDate) : new Date(app.createdAt);
      const applicationWeekIndex = this.resolveWeekIndex(applicationDate, weekStarts);
      if (applicationWeekIndex !== -1) {
        weeklyBuckets[applicationWeekIndex].applications += 1;
      }

      const hasResponse = app.status !== ApplicationStatus.APPLIED && app.status !== ApplicationStatus.GHOSTED;
      if (!hasResponse) {
        return;
      }

      const responseDate = new Date(app.updatedAt);
      const responseWeekIndex = this.resolveWeekIndex(responseDate, weekStarts);
      if (responseWeekIndex !== -1) {
        weeklyBuckets[responseWeekIndex].responses += 1;
      }
    });

    this.weeklyData = weeklyBuckets;
    this.maxWeeklyApplications = Math.max(
      ...this.weeklyData.map(d => Math.max(d.applications, d.responses)),
      1
    );
  }

  private getStartOfWeek(date: Date): Date {
    const normalized = new Date(date);
    const day = (normalized.getDay() + 6) % 7; // Monday = 0
    normalized.setDate(normalized.getDate() - day);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private resolveWeekIndex(date: Date, weekStarts: Date[]): number {
    if (Number.isNaN(date.getTime())) {
      return -1;
    }

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    for (let i = 0; i < weekStarts.length; i++) {
      const start = weekStarts[i];
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      if (normalized >= start && normalized < end) {
        return i;
      }
    }

    return -1;
  }
  
  getEventTypeLabel(type: TimelineEvent['type']): string {
    const labels = {
      'application': 'Candidature envoyée',
      'interview': 'Entretien programmé',
      'offer': 'Offre reçue',
      'offerAccepted': 'Offre acceptée',
      'offerDeclined': 'Offre déclinée',
      'rejection': 'Candidature refusée'
    };
    return labels[type];
  }
  
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }

  getCompanyLogoUrl(domain: string | undefined): string {
    return this.companySuggestionService.getLogoUrl(domain);
  }
}
