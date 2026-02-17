import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

import {
  Interview,
  InterviewType,
  InterviewTypeLabels,
  InterviewMode,
  InterviewModeLabels,
  CreateInterviewDto,
  UpdateInterviewDto
} from '../../models';
import { InterviewsService } from '../../services/interviews.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface InterviewFormDialogData {
  interview?: Interview;        // If editing
  applicationId?: string;       // If creating from application
  applicationTitle?: string;    // Pre-fill title context
}

@Component({
  selector: 'app-interview-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event</mat-icon>
      {{ isEdit ? 'Modifier l\\'entretien' : 'Planifier un entretien' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="interview-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" placeholder="Ex: Entretien RH - Google">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              @for (type of typeOptions; track type) {
                <mat-option [value]="type">{{ getTypeLabel(type) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mode</mat-label>
            <mat-select formControlName="mode">
              @for (mode of modeOptions; track mode) {
                <mat-option [value]="mode">{{ getModeLabel(mode) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Date et heure</mat-label>
            <input matInput type="datetime-local" formControlName="startAt">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fin (optionnel)</mat-label>
            <input matInput type="datetime-local" formControlName="endAt">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Lien de réunion (optionnel)</mat-label>
          <input matInput formControlName="meetingUrl" placeholder="https://meet.google.com/...">
          <mat-icon matPrefix>link</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Lieu (optionnel)</mat-label>
          <input matInput formControlName="location" placeholder="Ex: 42 rue de Paris">
          <mat-icon matPrefix>location_on</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes (optionnel)</mat-label>
          <textarea matInput formControlName="notes" rows="3"
                    placeholder="Préparation, contacts, informations..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid || saving">
        <mat-icon>{{ isEdit ? 'save' : 'event_available' }}</mat-icon>
        {{ isEdit ? 'Enregistrer' : 'Planifier' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .interview-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 480px;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .row mat-form-field {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h2 mat-icon {
      color: #667eea;
    }
    @media (max-width: 600px) {
      .interview-form { min-width: auto; }
      .row { flex-direction: column; gap: 4px; }
    }
  `]
})
export class InterviewFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  saving = false;

  typeOptions = Object.values(InterviewType);
  modeOptions = Object.values(InterviewMode);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InterviewFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InterviewFormDialogData,
    private interviewsService: InterviewsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.interview;

    this.form = this.fb.group({
      title: [this.data.interview?.title || this.data.applicationTitle || '', Validators.required],
      type: [this.data.interview?.type || InterviewType.HR, Validators.required],
      mode: [this.data.interview?.mode || InterviewMode.VIDEO, Validators.required],
      startAt: [this.data.interview ? this.toLocalDatetime(this.data.interview.startAt) : '', Validators.required],
      endAt: [this.data.interview?.endAt ? this.toLocalDatetime(this.data.interview.endAt) : ''],
      meetingUrl: [this.data.interview?.meetingUrl || ''],
      location: [this.data.interview?.location || ''],
      notes: [this.data.interview?.notes || '']
    });
  }

  getTypeLabel(type: InterviewType): string {
    return InterviewTypeLabels[type];
  }

  getModeLabel(mode: InterviewMode): string {
    return InterviewModeLabels[mode];
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const val = this.form.value;
    const startAt = new Date(val.startAt).toISOString();
    const endAt = val.endAt ? new Date(val.endAt).toISOString() : undefined;

    if (this.isEdit && this.data.interview) {
      const dto: UpdateInterviewDto = {
        title: val.title,
        type: val.type,
        mode: val.mode,
        startAt,
        endAt,
        meetingUrl: val.meetingUrl || undefined,
        location: val.location || undefined,
        notes: val.notes || undefined
      };
      this.interviewsService.update(this.data.interview.id, dto).subscribe({
        next: (result) => {
          this.notificationService.success('Entretien mis à jour !');
          this.dialogRef.close(result);
        },
        error: () => {
          this.notificationService.error('Erreur lors de la mise à jour');
          this.saving = false;
        }
      });
    } else {
      const dto: CreateInterviewDto = {
        applicationId: this.data.applicationId!,
        title: val.title,
        type: val.type,
        mode: val.mode,
        startAt,
        endAt,
        meetingUrl: val.meetingUrl || undefined,
        location: val.location || undefined,
        notes: val.notes || undefined
      };
      this.interviewsService.create(dto).subscribe({
        next: (result) => {
          this.notificationService.success('Entretien planifié !');
          this.dialogRef.close(result);
        },
        error: () => {
          this.notificationService.error('Erreur lors de la création');
          this.saving = false;
        }
      });
    }
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }
}
