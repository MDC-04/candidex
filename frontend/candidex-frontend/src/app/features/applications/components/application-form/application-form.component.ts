import { AfterViewInit, Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import {
  Application,
  ApplicationSource,
  ApplicationStatus,
  CreateApplicationDto,
  UpdateApplicationDto,
} from '../../models';
import { ApplicationsService } from '../../services/applications.service';
import { CompanySuggestionService, CompanySuggestion } from '../../services/company-suggestion.service';
import { LocationSuggestionService, LocationSuggestion } from '../../services/location-suggestion.service';
import { HttpErrorService } from '../../../../core/services/http-error.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface ApplicationFormDialogData {
  application?: Application;
}

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <h2 mat-dialog-title class="af-title">
      <span class="af-title-badge"><mat-icon>{{ isEditMode ? 'edit_note' : 'add_business' }}</mat-icon></span>
      <span class="af-title-text">{{ isEditMode ? 'Modifier la candidature' : 'Nouvelle candidature' }}</span>
    </h2>

    <form [formGroup]="form" class="af-form" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="af-content">

        <div class="af-section">
          <div class="af-section-label">Informations</div>

          <div class="af-field af-full af-company-field">
            <label>Entreprise <span class="af-req">*</span></label>
            <div class="af-company-input-wrapper" [class.has-logo]="selectedCompanyDomain">
              <img *ngIf="selectedCompanyDomain" class="af-company-logo" [src]="getCompanyLogoUrl(selectedCompanyDomain)" alt="">
              <input type="text" formControlName="companyName" placeholder="ex: Google" autocomplete="off" (focus)="showSuggestions = companySuggestions.length > 0">
            </div>
            <div class="af-suggestions" *ngIf="showSuggestions && companySuggestions.length > 0">
              <button type="button" class="af-suggestion-item" *ngFor="let s of companySuggestions" (mousedown)="selectCompany(s)">
                <img class="af-suggestion-logo" [src]="s.logoUrl" alt="" loading="lazy">
                <div class="af-suggestion-info">
                  <span class="af-suggestion-name">{{ s.name }}</span>
                  <span class="af-suggestion-domain">{{ s.domain }}</span>
                </div>
              </button>
            </div>
          </div>

          <div class="af-field af-full">
            <label>Intitulé du poste <span class="af-req">*</span></label>
            <input type="text" formControlName="roleTitle" placeholder="ex: Ingénieur logiciel">
          </div>

          <div class="af-row">
            <div class="af-field">
              <label>Type de contrat</label>
              <select formControlName="employmentType">
                <option value="">— Sélectionner —</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="INTERNSHIP">Stage</option>
                <option value="ALTERNANCE">Alternance</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
            <div class="af-field">
              <label>Source <span class="af-req">*</span></label>
              <select formControlName="source">
                <option value="LINKEDIN">LinkedIn</option>
                <option value="COMPANY_WEBSITE">Site entreprise</option>
                <option value="REFERRAL">Recommandation</option>
                <option value="JOB_BOARD">Site d'emploi</option>
                <option value="EMAIL">Email</option>
                <option value="SCHOOL_FORUM">Forum école</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          <div class="af-row">
            <div class="af-field">
              <label>Statut <span class="af-req">*</span></label>
              <select formControlName="status">
                <option value="APPLIED">Candidature envoyée</option>
                <option value="HR_INTERVIEW">Entretien RH</option>
                <option value="TECH_INTERVIEW">Entretien technique</option>
                <option value="OFFER">Offre reçue</option>
                <option value="OFFER_ACCEPTED">Offre acceptée</option>
                <option value="OFFER_DECLINED">Offre déclinée</option>
                <option value="REJECTED">Refusée</option>
                <option value="GHOSTED">Sans réponse</option>
              </select>
            </div>
            <div class="af-field">
              <label>Date de candidature</label>
              <input type="date" formControlName="appliedDate">
            </div>
          </div>
        </div>

        <div class="af-section">
          <div class="af-section-label">Localisation</div>
          <div class="af-field af-full af-location-field">
            <label>Lieu</label>
            <div class="af-location-input-wrapper">
              <mat-icon class="af-input-pin">place</mat-icon>
              <input type="text" formControlName="location" placeholder="ex: Paris, France" autocomplete="off" (focus)="showLocationSuggestions = locationSuggestions.length > 0" (blur)="onLocationBlur()">
            </div>
            <div class="af-suggestions" *ngIf="showLocationSuggestions && locationSuggestions.length > 0">
              <button type="button" class="af-suggestion-item" *ngFor="let s of locationSuggestions" (mousedown)="selectLocation(s)">
                <mat-icon class="af-location-icon">place</mat-icon>
                <span class="af-suggestion-name">{{ s.displayName }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="af-section">
          <div class="af-section-label">Rémunération</div>
          <div class="af-row af-triple">
            <div class="af-field">
              <label>Salaire</label>
              <input type="number" formControlName="salary" placeholder="ex: 45000" min="0">
            </div>
            <div class="af-field">
              <label>Devise</label>
              <select formControlName="currency">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="MAD">MAD</option>
              </select>
            </div>
            <div class="af-field">
              <label>Période</label>
              <select formControlName="salaryPeriod">
                <option value="">—</option>
                <option value="ANNUAL">Annuel</option>
                <option value="MONTHLY">Mensuel</option>
              </select>
            </div>
          </div>
        </div>

        <div class="af-section">
          <div class="af-section-label">Prochaine action</div>
          <div class="af-row">
            <div class="af-field">
              <label>Date de l'action</label>
              <input type="date" formControlName="nextActionDate">
            </div>
          </div>
          <div class="af-field af-full">
            <label>Note de suivi</label>
            <textarea formControlName="nextActionNote" rows="2" placeholder="ex: Relancer le recruteur mardi prochain"></textarea>
          </div>
        </div>

        <div class="af-section">
          <div class="af-section-label">Notes</div>
          <div class="af-field af-full">
            <textarea formControlName="notes" rows="3" placeholder="Ajoutez des notes..."></textarea>
          </div>
        </div>

      </mat-dialog-content>

      <mat-dialog-actions align="end" class="af-actions">
      <button type="button" class="af-btn-cancel" mat-dialog-close>Annuler</button>
      <button type="submit" class="af-btn-primary" [disabled]="isSubmitting">
        {{ isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }}
      </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .af-title {
      margin: 0;
      padding: 24px 30px 14px;
      font-size: clamp(1.65rem, 2.2vw, 2rem);
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      position: relative;
    }

    .af-title::after {
      content: '';
      position: absolute;
      left: 30px;
      bottom: 0;
      width: 108px;
      height: 4px;
      border-radius: 999px;
      background: var(--cx-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
      opacity: 0;
    }

    .af-form {
      display: flex;
      flex-direction: column;
      background: #ffffff;
    }

    .af-content {
      padding: 18px 30px 16px !important;
      max-height: 64vh !important;
    }

    .af-section {
      position: relative;
      margin-bottom: 16px;
      padding: 16px 16px 16px 22px;
      border: 1.5px solid rgba(85, 102, 240, 0.28);
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 6px 18px rgba(67, 56, 202, 0.06);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      animation: afSectionIn 0.45s var(--cx-ease, ease) both;
    }

    .af-section::before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      bottom: 2px;
      width: 4px;
      border-radius: 16px 0 0 16px;
      background: var(--cx-gradient, linear-gradient(135deg, #5566f0 0%, #8b4fd6 100%));
      opacity: 0.85;
    }

    .af-section:hover {
      border-color: rgba(85, 102, 240, 0.5);
      box-shadow: 0 12px 26px rgba(67, 56, 202, 0.12);
      transform: translateY(-2px);
    }

    /* Lift the active section (open dropdown) above the following sections */
    .af-section:focus-within {
      z-index: 30;
    }

    .af-section:nth-of-type(1) { animation-delay: 0.02s; }
    .af-section:nth-of-type(2) { animation-delay: 0.07s; }
    .af-section:nth-of-type(3) { animation-delay: 0.12s; }
    .af-section:nth-of-type(4) { animation-delay: 0.17s; }
    .af-section:nth-of-type(5) { animation-delay: 0.22s; }
    .af-section:nth-of-type(6) { animation-delay: 0.27s; }

    @keyframes afSectionIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes afBadgePop {
      0% { opacity: 0; transform: scale(0.4) rotate(-12deg); }
      100% { opacity: 1; transform: scale(1) rotate(0); }
    }

    .af-section-label {
      display: inline-flex;
      align-items: center;
      margin: 0 0 12px;
      padding: 5px 11px;
      border-radius: 999px;
      font-size: 12px !important;
      line-height: 1;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--cx-primary-dark, #4338ca);
      background: rgba(85, 102, 240, 0.12);
      border: 1px solid rgba(85, 102, 240, 0.28);
    }

    .af-section-label::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      margin-right: 8px;
      background: var(--cx-gradient, linear-gradient(135deg, #5566f0 0%, #8b4fd6 100%));
    }

    .af-field {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      flex: 1;
      min-width: 0;
    }

    .af-field.af-full {
      width: 100%;
    }

    .af-field label {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .af-req {
      color: #dc2626;
    }

    .af-company-field {
      position: relative;
    }

    .af-location-field {
      position: relative;
    }

    .af-location-icon {
      flex-shrink: 0;
      color: var(--cx-primary, #5566f0);
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .af-location-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .af-input-pin {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--cx-primary, #5566f0);
      font-size: 19px;
      width: 19px;
      height: 19px;
      pointer-events: none;
    }

    .af-location-field .af-location-input-wrapper input {
      padding-left: 42px !important;
    }

    .af-company-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .af-company-logo {
      position: absolute;
      left: 12px;
      width: 22px;
      height: 22px;
      border-radius: 4px;
      object-fit: contain;
      pointer-events: none;
    }

    .af-company-input-wrapper input {
      padding-left: 13px;
    }

    .af-company-input-wrapper.has-logo input {
      padding-left: 42px;
    }

    .af-company-logo + input {
      padding-left: 42px;
    }

    .af-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 100;
      background: #fff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      max-height: 220px;
      overflow-y: auto;
      margin-top: 4px;
    }

    .af-suggestion-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: none;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: background 0.15s;
    }

    .af-suggestion-item:hover {
      background: rgba(85, 102, 240, 0.08);
    }

    .af-suggestion-logo {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: contain;
      flex-shrink: 0;
      background: rgba(85, 102, 240, 0.08);
    }

    .af-suggestion-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .af-suggestion-name {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .af-suggestion-domain {
      font-size: 12px;
      color: #64748b;
    }

    .af-field input,
    .af-field select,
    .af-field textarea {
      width: 100%;
      height: 44px;
      padding: 0 13px;
      font-size: 14px;
      font-family: inherit;
      border: 1.5px solid rgba(85, 102, 240, 0.28);
      border-radius: 10px;
      background: #ffffff;
      color: #0f172a;
      transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
      box-sizing: border-box;
    }

    .af-field textarea {
      min-height: 86px;
      padding: 10px 13px;
      resize: vertical;
    }

    .af-field input::placeholder,
    .af-field textarea::placeholder {
      color: #94a3b8;
    }

    .af-field input:hover,
    .af-field select:hover,
    .af-field textarea:hover {
      background: #ffffff;
      border-color: rgba(85, 102, 240, 0.5);
    }

    .af-field input:focus,
    .af-field select:focus,
    .af-field textarea:focus {
      outline: none;
      border-color: var(--cx-primary, #5566f0);
      box-shadow: 0 0 0 4px rgba(85, 102, 240, 0.18);
      background: #ffffff;
    }

    .af-field select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 11px center;
      padding-right: 36px;
    }

    .af-row {
      display: flex;
      gap: 12px;
    }

    .af-row.af-triple .af-field {
      flex: 1;
    }

    .af-actions {
      margin: 0;
      padding: 14px 30px 20px !important;
      border-top: 1.5px solid var(--cx-border, rgba(85, 102, 240, 0.2));
      background: #ffffff;
      gap: 10px;
    }

    .af-btn-cancel,
    .af-btn-primary {
      height: 42px;
      padding: 0 18px;
      min-width: 108px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.14s, box-shadow 0.18s, opacity 0.18s, background-color 0.18s;
    }

    .af-btn-cancel {
      border: 1.5px solid rgba(85, 102, 240, 0.30);
      background: #ffffff;
      color: var(--cx-primary-dark, #4338ca);
    }

    .af-btn-cancel:hover {
      background: rgba(85, 102, 240, 0.06);
      border-color: rgba(85, 102, 240, 0.5);
    }

    .af-btn-primary {
      border: 1px solid transparent;
      background: var(--cx-gradient, linear-gradient(135deg, #5566f0 0%, #8b4fd6 100%));
      color: #ffffff;
      box-shadow: 0 8px 18px rgba(85, 102, 240, 0.35);
    }

    .af-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(85, 102, 240, 0.45);
    }

    .af-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .af-btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: none;
    }

    @media (max-width: 640px) {
      .af-title {
        padding: 16px 18px 12px;
        font-size: 1.5rem;
      }

      .af-title::after {
        left: 18px;
      }

      .af-content {
        padding: 12px 18px 10px !important;
        max-height: 60vh !important;
      }

      .af-actions {
        padding: 12px 18px 16px !important;
      }

      .af-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ApplicationFormComponent implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  companySuggestions: CompanySuggestion[] = [];
  showSuggestions = false;
  selectedCompanyDomain: string | null = null;
  locationSuggestions: LocationSuggestion[] = [];
  showLocationSuggestions = false;
  private selectedCity = '';
  private selectedCountry = '';
  private destroy$ = new Subject<void>();

  private readonly sourceValues = [
    'LINKEDIN',
    'COMPANY_WEBSITE',
    'REFERRAL',
    'JOB_BOARD',
    'EMAIL',
    'SCHOOL_FORUM',
    'OTHER'
  ];

  private readonly statusValues = [
    'APPLIED',
    'HR_INTERVIEW',
    'TECH_INTERVIEW',
    'OFFER',
    'OFFER_ACCEPTED',
    'OFFER_DECLINED',
    'REJECTED',
    'GHOSTED'
  ];

  get isCoreFieldsInvalid(): boolean {
    if (!this.form) return true;
    return !!this.form.get('companyName')?.invalid || !!this.form.get('roleTitle')?.invalid;
  }

  constructor(
    private fb: FormBuilder,
    private applicationsService: ApplicationsService,
    private companySuggestionService: CompanySuggestionService,
    private locationSuggestionService: LocationSuggestionService,
    private httpErrorService: HttpErrorService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<ApplicationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationFormDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.application;
    const app = this.data?.application;

    this.selectedCompanyDomain = app?.companyDomain ?? null;

    const locationDisplay = [app?.city, app?.country].filter(Boolean).join(', ');
    this.selectedCity = app?.city ?? '';
    this.selectedCountry = app?.country ?? '';

    this.form = this.fb.group({
      companyName: [app?.companyName ?? '', [Validators.required, Validators.maxLength(120)]],
      roleTitle: [app?.roleTitle ?? '', [Validators.required, Validators.maxLength(120)]],
      location: [locationDisplay],
      source: [app?.source ?? 'LINKEDIN'],
      status: [app?.status ?? 'APPLIED'],
      employmentType: [app?.employmentType ?? ''],
      appliedDate: [app?.appliedDate?.substring(0, 10) ?? ''],
      salary: [app?.salary ?? null],
      currency: [app?.currency ?? 'EUR'],
      salaryPeriod: [app?.salaryPeriod ?? ''],
      notes: [app?.notes ?? ''],
      nextActionDate: [app?.nextAction?.date ?? ''],
      nextActionNote: [app?.nextAction?.note ?? '', [Validators.maxLength(300)]],
    });

    this.form.get('companyName')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => this.companySuggestionService.suggest(val)),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.companySuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
    });

    this.form.get('location')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => this.locationSuggestionService.suggest(val)),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.locationSuggestions = suggestions;
      this.showLocationSuggestions = suggestions.length > 0;
    });

    this.ensureSelectDefaults();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.ensureSelectDefaults());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCompany(suggestion: CompanySuggestion): void {
    this.form.get('companyName')!.setValue(suggestion.name, { emitEvent: false });
    this.selectedCompanyDomain = suggestion.domain;
    this.companySuggestions = [];
    this.showSuggestions = false;
  }

  getCompanyLogoUrl(domain: string): string {
    return this.companySuggestionService.getLogoUrl(domain);
  }

  selectLocation(suggestion: LocationSuggestion): void {
    this.form.get('location')!.setValue(suggestion.displayName, { emitEvent: false });
    this.selectedCity = suggestion.city;
    this.selectedCountry = suggestion.country;
    this.locationSuggestions = [];
    this.showLocationSuggestions = false;
  }

  onLocationBlur(): void {
    setTimeout(() => this.showLocationSuggestions = false, 200);
  }

  private ensureSelectDefaults(): void {
    if (!this.form) return;

    const source = this.form.get('source')?.value;
    const status = this.form.get('status')?.value;
    const currency = this.form.get('currency')?.value;

    this.form.patchValue(
      {
        source: this.sourceValues.includes(source) ? source : 'LINKEDIN',
        status: this.statusValues.includes(status) ? status : 'APPLIED',
        currency: currency || 'EUR',
      },
      { emitEvent: false }
    );
  }

  onSubmit(): void {
    this.ensureSelectDefaults();
    if (this.isCoreFieldsInvalid) {
      this.form.markAllAsTouched();
      this.notificationService.warning('Veuillez renseigner Entreprise et Intitulé du poste.');
      return;
    }

    const v = this.form.value;
    const nextActionDate = (v.nextActionDate || '').trim();
    const nextActionNote = (v.nextActionNote || '').trim();

    if (!nextActionDate && nextActionNote) {
      this.notificationService.warning('Renseignez une date pour la prochaine action ou videz la note.');
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      companyName: v.companyName,
      companyDomain: this.selectedCompanyDomain || undefined,
      roleTitle: v.roleTitle,
      source: v.source || 'LINKEDIN',
      status: v.status || 'APPLIED',
      currency: v.currency || 'EUR',
    };
    if (this.selectedCity) payload.city = this.selectedCity;
    if (this.selectedCountry) payload.country = this.selectedCountry;
    if (v.employmentType) payload.employmentType = v.employmentType;
    if (v.appliedDate) payload.appliedDate = v.appliedDate;
    if (v.salary != null && v.salary !== '') payload.salary = +v.salary;
    if (v.salaryPeriod) payload.salaryPeriod = v.salaryPeriod;
    if (v.notes) payload.notes = v.notes;
    if (nextActionDate) {
      payload.nextAction = {
        date: nextActionDate,
        done: false,
        ...(nextActionNote ? { note: nextActionNote } : {})
      };
    }

    const req$ = this.isEditMode
      ? this.applicationsService.update(this.data.application!.id, payload as UpdateApplicationDto)
      : this.applicationsService.create(payload as CreateApplicationDto);

    req$.subscribe({
      next: (result) => {
        this.notificationService.success(this.isEditMode ? 'Candidature modifiée !' : 'Candidature créée !');
        this.dialogRef.close(result);
      },
      error: (err) => {
        const actionLabel = this.isEditMode ? 'la mise à jour de la candidature' : 'la création de la candidature';
        this.notificationService.error(this.httpErrorService.getActionMessage(err, actionLabel));
        this.isSubmitting = false;
      }
    });
  }
}
