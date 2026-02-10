import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Application, ApplicationSource, ApplicationStatus, CreateApplicationDto, UpdateApplicationDto } from '../../models';
import { ApplicationsService } from '../../services/applications.service';

/**
 * Dialog data for ApplicationFormComponent
 */
export interface ApplicationFormDialogData {
  application?: Application; // If provided, edit mode; otherwise, create mode
}

/**
 * Form component for creating or editing job applications
 * 
 * Features:
 * - Reactive forms with validation
 * - Material Design UI
 * - Create mode (new application) or Edit mode (existing application)
 * - Form validation (required fields, salary range)
 */
@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.scss'
})
export class ApplicationFormComponent implements OnInit {
  
  /**
   * Reactive form group
   */
  form!: FormGroup;

  /**
   * Edit mode flag
   */
  isEditMode = false;

  /**
   * Available status options
   */
  statusOptions = Object.values(ApplicationStatus);

  /**
   * Available source options
   */
  sourceOptions = Object.values(ApplicationSource);

  /**
   * Currency options
   */
  currencyOptions = ['EUR', 'USD', 'GBP', 'CAD'];

  /**
   * Form submission loading state
   */
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private applicationsService: ApplicationsService,
    public dialogRef: MatDialogRef<ApplicationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationFormDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.application;
    this.initForm();
  }

  /**
   * Initialize the reactive form
   */
  private initForm(): void {
    const app = this.data?.application;

    this.form = this.fb.group({
      companyName: [app?.companyName || '', [Validators.required, Validators.maxLength(120)]],
      roleTitle: [app?.roleTitle || '', [Validators.required, Validators.maxLength(120)]],
      location: [app?.location || '', Validators.maxLength(120)],
      source: [app?.source || ApplicationSource.LINKEDIN, Validators.required],
      status: [app?.status || ApplicationStatus.APPLIED, Validators.required],
      appliedDate: [app?.appliedDate || ''],
      salaryMin: [app?.salaryMin || null, [Validators.min(0)]],
      salaryMax: [app?.salaryMax || null, [Validators.min(0)]],
      currency: [app?.currency || 'EUR'],
      notes: [app?.notes || '', Validators.maxLength(5000)],
      // Tags and links will be added in a future iteration
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.form.value;

    if (this.isEditMode) {
      // Update existing application
      const updateDto: UpdateApplicationDto = {
        ...formValue,
        appliedDate: formValue.appliedDate ? this.formatDate(formValue.appliedDate) : undefined
      };

      this.applicationsService.update(this.data.application!.id, updateDto).subscribe({
        next: (updated) => {
          this.dialogRef.close(updated); // Return updated application
        },
        error: (err) => {
          console.error('Error updating application:', err);
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new application
      const createDto: CreateApplicationDto = {
        ...formValue,
        appliedDate: formValue.appliedDate ? this.formatDate(formValue.appliedDate) : undefined
      };

      this.applicationsService.create(createDto).subscribe({
        next: (created) => {
          this.dialogRef.close(created); // Return created application
        },
        error: (err) => {
          console.error('Error creating application:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  /**
   * Close dialog without saving
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['maxlength']) {
      return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return `Minimum value is ${field.errors['min'].min}`;
    }

    return 'Invalid value';
  }
}
