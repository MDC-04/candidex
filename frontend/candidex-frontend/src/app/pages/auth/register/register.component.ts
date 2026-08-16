import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompanySuggestionService, CompanySuggestion } from '../../../features/applications/services/company-suggestion.service';
import { LocationSuggestionService, LocationSuggestion } from '../../../features/applications/services/location-suggestion.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="auth-split">
      <!-- LEFT: form -->
      <section class="auth-left">
        <div class="auth-inner">
          <div class="auth-brand">
            <img src="Logo_CandiNote.png" alt="CandiNote">
          </div>

          <div class="auth-head">
            <span class="auth-eyebrow">Nouveau compte</span>
            <h1 class="auth-title">Créer un compte</h1>
            <p class="auth-sub">Rejoignez CandiNote et organisez votre recherche d'emploi.</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
            <div class="field">
              <label>Nom complet</label>
              <div class="input-wrap">
                <mat-icon>person</mat-icon>
                <input type="text" formControlName="fullName" placeholder="Jean Dupont" autocomplete="name">
              </div>
              @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.hasError('required')) { <span class="err">Le nom complet est requis</span> }
            </div>

            <div class="field">
              <label>Adresse email</label>
              <div class="input-wrap">
                <mat-icon>mail</mat-icon>
                <input type="email" formControlName="email" placeholder="jean.dupont@exemple.com" autocomplete="email">
              </div>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('required')) { <span class="err">L'email est requis</span> }
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('email')) { <span class="err">Veuillez entrer un email valide</span> }
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="input-wrap">
                <mat-icon>lock</mat-icon>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Min. 8 caractères" autocomplete="new-password">
                <button type="button" class="toggle" (click)="showPassword = !showPassword" tabindex="-1" [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('required')) { <span class="err">Le mot de passe est requis</span> }
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) { <span class="err">Au moins 8 caractères</span> }
            </div>

            <div class="divider">Informations professionnelles · optionnel</div>

            <div class="two-col">
              <div class="field">
                <label>Poste actuel</label>
                <div class="input-wrap">
                  <mat-icon>work_outline</mat-icon>
                  <input type="text" formControlName="currentPosition" placeholder="Ingénieur logiciel">
                </div>
              </div>
              <div class="field ac-field">
                <label>Entreprise / École</label>
                <div class="input-wrap">
                  @if (selectedCompanyDomain) {
                    <img class="ac-logo" [src]="getCompanyLogoUrl(selectedCompanyDomain)" alt="">
                  } @else {
                    <mat-icon>business</mat-icon>
                  }
                  <input type="text" formControlName="company" placeholder="Tech Corp" autocomplete="off"
                         (focus)="showCompanySuggestions = companySuggestions.length > 0"
                         (blur)="onCompanyBlur()">
                </div>
                @if (showCompanySuggestions && companySuggestions.length > 0) {
                  <div class="ac-panel">
                    @for (s of companySuggestions; track s.domain) {
                      <button type="button" class="ac-item" (mousedown)="selectCompany(s)">
                        <img class="ac-item-logo" [src]="s.logoUrl" alt="" loading="lazy">
                        <span class="ac-item-main">
                          <span class="ac-item-name">{{ s.name }}</span>
                          <span class="ac-item-sub">{{ s.domain }}</span>
                        </span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="two-col">
              <div class="field ac-field">
                <label>Localisation</label>
                <div class="input-wrap">
                  <mat-icon>location_on</mat-icon>
                  <input type="text" formControlName="location" placeholder="Paris, France" autocomplete="off"
                         (focus)="showLocationSuggestions = locationSuggestions.length > 0"
                         (blur)="onLocationBlur()">
                </div>
                @if (showLocationSuggestions && locationSuggestions.length > 0) {
                  <div class="ac-panel">
                    @for (s of locationSuggestions; track s.displayName) {
                      <button type="button" class="ac-item" (mousedown)="selectLocation(s)">
                        <mat-icon class="ac-loc-icon">place</mat-icon>
                        <span class="ac-item-name">{{ s.displayName }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
              <div class="field">
                <label>Téléphone</label>
                <div class="input-wrap">
                  <mat-icon>phone</mat-icon>
                  <input type="tel" formControlName="phone" placeholder="+33 6 12 34 56 78">
                </div>
              </div>
            </div>

            @if (errorMessage) { <div class="alert">{{ errorMessage }}</div> }

            <button type="submit" class="submit" [disabled]="registerForm.invalid || loading">
              @if (!loading) { <span>Créer mon compte</span><mat-icon>arrow_forward</mat-icon> }
              @if (loading) { <mat-spinner diameter="22"></mat-spinner> }
            </button>
          </form>

          <p class="switch">Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
        </div>
      </section>

      <!-- RIGHT: illustration -->
      <aside class="auth-right">
        <div class="right-content">
          <h2 class="right-title">Votre carrière,<br><span>enfin organisée.</span></h2>
          <p class="right-sub">Créez votre compte et prenez une longueur d'avance sur chaque candidature, entretien et opportunité.</p>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .auth-split {
      height: 100vh;
      display: grid;
      grid-template-columns: 40% 60%;
      background: #ffffff;
    }

    /* ---------- LEFT: form ---------- */
    .auth-left {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: clamp(2rem, 5vh, 3.5rem) 2rem;
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 100vh;
    }

    .auth-inner {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
      animation: authIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .auth-brand { text-align: center; margin-bottom: 0.4rem; }
    .auth-brand img {
      height: 300px;
      width: auto;
      object-fit: contain;
      margin: 0;
    }

    .auth-head { margin-bottom: 1.5rem; }
    .auth-eyebrow {
      display: block;
      width: fit-content;
      margin: 0 auto 0.9rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cx-primary);
      background: rgba(85, 102, 240, 0.10);
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
    }
    .auth-title {
      margin: 0 0 0.4rem;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #1a1550;
    }
    .auth-sub { margin: 0; color: #64748b; font-size: 0.96rem; }

    .auth-form { display: flex; flex-direction: column; gap: 1rem; }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field > label { font-size: 0.82rem; font-weight: 600; color: #334155; }

    .two-col { display: flex; flex-direction: column; gap: 1rem; }

    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0.35rem 0 0.1rem;
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--cx-border);
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid var(--cx-border-strong);
      border-radius: var(--cx-radius-sm);
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .input-wrap:focus-within {
      border-color: var(--cx-primary);
      box-shadow: 0 0 0 4px rgba(85, 102, 240, 0.14);
    }
    .input-wrap > mat-icon {
      color: var(--cx-primary);
      margin: 0 0.15rem 0 0.7rem;
      font-size: 20px; width: 20px; height: 20px;
    }
    .input-wrap input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      padding: 0.8rem 0.5rem;
      font-size: 0.95rem;
      color: #1e293b;
    }
    .input-wrap input::placeholder { color: #a3aac2; }
    .input-wrap .toggle {
      background: none; border: none; cursor: pointer;
      display: grid; place-items: center;
      padding: 0 0.6rem; color: #94a3b8;
      transition: color 0.18s ease;
    }
    .input-wrap .toggle:hover { color: var(--cx-primary); }
    .input-wrap .toggle mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .err { font-size: 0.78rem; color: #e11d48; font-weight: 500; }

    .alert {
      padding: 0.75rem 0.9rem;
      background: rgba(225, 29, 72, 0.10);
      border: 1px solid rgba(225, 29, 72, 0.30);
      border-radius: var(--cx-radius-sm);
      color: #be123c;
      font-size: 0.86rem;
      font-weight: 500;
      text-align: center;
    }

    .submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.9rem;
      margin-top: 0.35rem;
      border: none;
      border-radius: var(--cx-radius-sm);
      cursor: pointer;
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      background: var(--cx-gradient);
      box-shadow: 0 10px 24px rgba(85, 102, 240, 0.35);
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    }
    .submit mat-icon { font-size: 20px; width: 20px; height: 20px; transition: transform 0.2s ease; }
    .submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(85, 102, 240, 0.45); }
    .submit:hover:not(:disabled) mat-icon { transform: translateX(3px); }
    .submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

    .switch { text-align: center; margin-top: 1.35rem; font-size: 0.9rem; color: #64748b; }
    .switch a { color: var(--cx-primary); font-weight: 700; text-decoration: none; }
    .switch a:hover { text-decoration: underline; }

    /* ---------- Autocomplete (company / location) ---------- */
    .ac-field { position: relative; }
    .ac-logo {
      width: 20px; height: 20px; border-radius: 5px; object-fit: contain;
      background: #f1f3ff; margin: 0 0.15rem 0 0.7rem; flex-shrink: 0;
    }
    .ac-panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0; right: 0;
      z-index: 40;
      background: #fff;
      border: 1.5px solid var(--cx-border-strong);
      border-radius: var(--cx-radius-sm);
      box-shadow: 0 16px 36px rgba(30, 27, 90, 0.18);
      overflow: hidden;
    }
    .ac-item {
      display: flex; align-items: center; gap: 0.6rem;
      width: 100%; padding: 0.55rem 0.75rem;
      border: none; background: transparent; cursor: pointer; text-align: left;
      transition: background 0.15s ease;
    }
    .ac-item:hover { background: rgba(85, 102, 240, 0.08); }
    .ac-item .ac-loc-icon { color: var(--cx-primary); font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .ac-item-logo { width: 24px; height: 24px; border-radius: 5px; object-fit: contain; background: #f1f3ff; flex-shrink: 0; }
    .ac-item-main { display: flex; flex-direction: column; min-width: 0; }
    .ac-item-name { font-weight: 600; color: #1e293b; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ac-item-sub { font-size: 0.74rem; color: #94a3b8; }

    /* ---------- RIGHT: illustration ---------- */
    .auth-right {
      position: relative;
      overflow: hidden;
      background: url('/Login_CandiNote.png') center center / cover no-repeat;
    }
    .auth-right::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 12, 45, 0.45) 0%, rgba(15, 12, 45, 0) 34%);
      pointer-events: none;
    }
    .right-content {
      position: relative;
      z-index: 2;
      padding: 2.75rem 3rem;
      color: #fff;
      max-width: 620px;
    }
    .right-title {
      margin: 0 0 0.9rem;
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.12;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
    }
    .right-title span {
      background: linear-gradient(120deg, #c4b5fd, #a5b4fc);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .right-sub {
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.88);
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      max-width: 420px;
    }

    @keyframes authIn {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    mat-spinner { margin: 0 auto; }

    @media (max-width: 900px) {
      .auth-split { grid-template-columns: 1fr; height: auto; min-height: 100vh; }
      .auth-right { display: none; }
      .auth-left {
        max-height: none;
        overflow-y: visible;
        padding: 2rem 1.25rem 3rem;
      }
      .auth-brand img { height: 220px; }
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  companySuggestions: CompanySuggestion[] = [];
  showCompanySuggestions = false;
  selectedCompanyDomain: string | null = null;
  locationSuggestions: LocationSuggestion[] = [];
  showLocationSuggestions = false;
  private destroy$ = new Subject<void>();
  
  private httpErrorService = inject(HttpErrorService);
  private notificationService = inject(NotificationService);
  private companySuggestionService = inject(CompanySuggestionService);
  private locationSuggestionService = inject(LocationSuggestionService);
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      currentPosition: [''],
      company: [''],
      location: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.registerForm.get('company')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        this.selectedCompanyDomain = null;
        return this.companySuggestionService.suggest(val || '');
      }),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.companySuggestions = suggestions;
      this.showCompanySuggestions = suggestions.length > 0;
    });

    this.registerForm.get('location')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => this.locationSuggestionService.suggest(val || '')),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.locationSuggestions = suggestions;
      this.showLocationSuggestions = suggestions.length > 0;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCompany(suggestion: CompanySuggestion): void {
    this.registerForm.get('company')!.setValue(suggestion.name, { emitEvent: false });
    this.selectedCompanyDomain = suggestion.domain;
    this.companySuggestions = [];
    this.showCompanySuggestions = false;
  }

  onCompanyBlur(): void {
    setTimeout(() => (this.showCompanySuggestions = false), 200);
  }

  getCompanyLogoUrl(domain: string): string {
    return this.companySuggestionService.getLogoUrl(domain);
  }

  selectLocation(suggestion: LocationSuggestion): void {
    this.registerForm.get('location')!.setValue(suggestion.displayName, { emitEvent: false });
    this.locationSuggestions = [];
    this.showLocationSuggestions = false;
  }

  onLocationBlur(): void {
    setTimeout(() => (this.showLocationSuggestions = false), 200);
  }
  
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
    
    if (this.registerForm.invalid) {
      this.errorMessage = 'Merci de remplir correctement tous les champs obligatoires.';
      this.notificationService.error(this.errorMessage);
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Compte créé avec succès ! Bienvenue sur CandiNote.');
        this.router.navigate(['/applications']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.httpErrorService.getAuthMessage(error, 'register');
        this.notificationService.error(this.errorMessage);
      }
    });
  }
}
