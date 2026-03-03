import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

import { Interview, InterviewType, InterviewTypeLabels, InterviewMode, InterviewModeLabels } from '../../models';

export interface PrepPackDialogData {
  interview: Interview;
}

export interface PrepPackDialogResult {
  notes: string;
  feedback: string;
}

@Component({
  selector: 'app-prep-pack-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <div class="prep-dialog">
      <div class="prep-dialog-header">
        <h2 mat-dialog-title>Préparation</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="prep-dialog-content">
        <h3 class="prep-title">{{ interview.title }}</h3>

        <div class="prep-chips">
          <span class="type-chip"
            [style.background-color]="getTypeColor(interview.type)"
            [style.color]="getTypeTextColor(interview.type)">
            {{ getTypeLabel(interview.type) }}
          </span>
          <span class="mode-badge">
            <mat-icon>{{ getModeIcon(interview.mode) }}</mat-icon>
            {{ getModeLabel(interview.mode) }}
          </span>
        </div>

        <p class="prep-datetime">
          <mat-icon>schedule</mat-icon>
          {{ formatDate(interview.startAt) }} · {{ formatTime(interview.startAt) }}
          @if (interview.endAt) { – {{ formatTime(interview.endAt) }} }
        </p>

        <mat-divider></mat-divider>

        @if (interview.questionsToAsk && interview.questionsToAsk.length > 0) {
          <div class="prep-section">
            <h4><mat-icon>help_outline</mat-icon> Questions à poser</h4>
            <ul class="prep-list">
              @for (q of interview.questionsToAsk; track q) { <li>{{ q }}</li> }
            </ul>
          </div>
        }

        @if (interview.checklistItems && interview.checklistItems.length > 0) {
          <div class="prep-section">
            <h4><mat-icon>checklist</mat-icon> Checklist</h4>
            <ul class="prep-list">
              @for (item of interview.checklistItems; track item) { <li>✅ {{ item }}</li> }
            </ul>
          </div>
        }

        @if (interview.links && interview.links.length > 0) {
          <div class="prep-section">
            <h4><mat-icon>link</mat-icon> Liens utiles</h4>
            <ul class="prep-list">
              @for (link of interview.links; track link) {
                <li><a [href]="link" target="_blank" class="prep-link">{{ link }}</a></li>
              }
            </ul>
          </div>
        }

        @if (interview.meetingUrl) {
          <div class="prep-section">
            <h4><mat-icon>videocam</mat-icon> Lien de réunion</h4>
            <a [href]="interview.meetingUrl" target="_blank" mat-stroked-button color="primary">
              <mat-icon>open_in_new</mat-icon> Rejoindre
            </a>
          </div>
        }

        <mat-divider></mat-divider>

        <div class="prep-section">
          <h4><mat-icon>notes</mat-icon> Notes</h4>
          <mat-form-field appearance="outline" class="full-width">
            <textarea matInput [(ngModel)]="editingNotes" rows="5"
                      placeholder="Vos notes de préparation..."></textarea>
          </mat-form-field>
        </div>

        @if (interview.status === 'DONE') {
          <div class="prep-section">
            <h4><mat-icon>rate_review</mat-icon> Feedback</h4>
            <mat-form-field appearance="outline" class="full-width">
              <textarea matInput [(ngModel)]="editingFeedback" rows="4"
                        placeholder="Comment s'est passé l'entretien ?"></textarea>
            </mat-form-field>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" (click)="save()">
          <mat-icon>save</mat-icon> Sauvegarder
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .prep-dialog {
      display: flex;
      flex-direction: column;
      min-width: 520px;
      max-width: 600px;
    }

    .prep-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 0;

      h2 { margin: 0; font-size: 20px; font-weight: 700; }
    }

    .prep-dialog-content {
      padding: 16px 24px !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .prep-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px;
      color: #1e293b;
    }

    .prep-chips {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .type-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;

      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .prep-datetime {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      margin: 8px 0 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    mat-divider { margin: 12px 0 !important; }

    .prep-section {
      margin: 14px 0;

      h4 {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        mat-icon { font-size: 16px; width: 16px; height: 16px; color: #667eea; }
      }
    }

    .prep-list {
      margin: 0;
      padding-left: 20px;
      li { font-size: 14px; color: #1e293b; line-height: 1.8; }
    }

    .prep-link {
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
      word-break: break-all;
      &:hover { text-decoration: underline; }
    }

    .full-width { width: 100%; }
  `]
})
export class PrepPackDialogComponent {
  interview: Interview;
  editingNotes: string;
  editingFeedback: string;

  constructor(
    private dialogRef: MatDialogRef<PrepPackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: PrepPackDialogData
  ) {
    this.interview = data.interview;
    this.editingNotes = data.interview.notes || '';
    this.editingFeedback = data.interview.feedback || '';
  }

  save(): void {
    this.dialogRef.close({ notes: this.editingNotes, feedback: this.editingFeedback });
  }

  getTypeLabel(type: InterviewType): string { return InterviewTypeLabels[type]; }
  getModeLabel(mode: InterviewMode): string { return InterviewModeLabels[mode]; }

  getTypeColor(type: InterviewType): string {
    switch (type) {
      case InterviewType.HR:        return '#ede9fe';
      case InterviewType.TECH:      return '#dbeafe';
      case InterviewType.MANAGER:   return '#d1fae5';
      case InterviewType.TAKE_HOME: return '#fef3c7';
      case InterviewType.OTHER:     return '#f1f5f9';
      default:                      return '#ede9fe';
    }
  }

  getTypeTextColor(type: InterviewType): string {
    switch (type) {
      case InterviewType.HR:        return '#6d28d9';
      case InterviewType.TECH:      return '#1d4ed8';
      case InterviewType.MANAGER:   return '#065f46';
      case InterviewType.TAKE_HOME: return '#92400e';
      case InterviewType.OTHER:     return '#475569';
      default:                      return '#6d28d9';
    }
  }

  getModeIcon(mode: InterviewMode): string {
    switch (mode) {
      case InterviewMode.VIDEO:  return 'videocam';
      case InterviewMode.ONSITE: return 'business';
      case InterviewMode.PHONE:  return 'phone';
      default:                   return 'event';
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
