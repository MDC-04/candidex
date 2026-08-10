import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
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
            <span class="auth-eyebrow">Espace candidat</span>
            <h1 class="auth-title">Bon retour !</h1>
            <p class="auth-sub">Connectez-vous pour suivre vos candidatures.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
            <div class="field">
              <label>Adresse email</label>
              <div class="input-wrap">
                <mat-icon>mail</mat-icon>
                <input type="email" formControlName="email" placeholder="jean.dupont@exemple.com" autocomplete="email">
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('required')) { <span class="err">L'email est requis</span> }
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('email')) { <span class="err">Veuillez entrer un email valide</span> }
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="input-wrap">
                <mat-icon>lock</mat-icon>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Votre mot de passe" autocomplete="current-password">
                <button type="button" class="toggle" (click)="showPassword = !showPassword" tabindex="-1" [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) { <span class="err">Le mot de passe est requis</span> }
            </div>

            <a routerLink="/auth/forgot-password" class="forgot">Mot de passe oublié ?</a>

            @if (errorMessage) { <div class="alert">{{ errorMessage }}</div> }

            <button type="submit" class="submit" [disabled]="loginForm.invalid || loading">
              @if (!loading) { <span>Se connecter</span><mat-icon>arrow_forward</mat-icon> }
              @if (loading) { <mat-spinner diameter="22"></mat-spinner> }
            </button>
          </form>

          <p class="switch">Pas encore de compte ? <a routerLink="/auth/register">Créer un compte</a></p>
        </div>
      </section>

      <!-- RIGHT: illustration -->
      <aside class="auth-right">
        <div class="right-content">
          <h2 class="right-title">Suivez. Préparez.<br><span>Décrochez.</span></h2>
          <p class="right-sub">Centralisez vos candidatures, préparez vos entretiens et gardez le cap vers le poste de vos rêves.</p>
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
      align-items: center;
      justify-content: center;
      padding: 2.5rem 2rem;
      overflow-y: auto;
      max-height: 100vh;
    }

    .auth-inner {
      width: 100%;
      max-width: 400px;
      animation: authIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .auth-brand { margin-bottom: 0.4rem; }
    .auth-brand img {
      height: 158px;
      width: auto;
      object-fit: contain;
      margin: -14px 0 -12px -12px;
    }

    .auth-head { margin-bottom: 1.75rem; }
    .auth-eyebrow {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cx-primary);
      background: rgba(85, 102, 240, 0.10);
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }
    .auth-title {
      margin: 0 0 0.4rem;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #1a1550;
    }
    .auth-sub { margin: 0; color: #64748b; font-size: 0.96rem; }

    .auth-form { display: flex; flex-direction: column; gap: 1.05rem; }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field > label { font-size: 0.82rem; font-weight: 600; color: #334155; }

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

    .forgot {
      align-self: flex-end;
      font-size: 0.84rem;
      color: var(--cx-primary);
      text-decoration: none;
      font-weight: 600;
      margin-top: -0.4rem;
    }
    .forgot:hover { text-decoration: underline; }

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

    .switch { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #64748b; }
    .switch a { color: var(--cx-primary); font-weight: 700; text-decoration: none; }
    .switch a:hover { text-decoration: underline; }

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

    /* Stack on smaller screens: hide illustration, full-width form */
    @media (max-width: 900px) {
      .auth-split { grid-template-columns: 1fr; }
      .auth-right { display: none; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  
  private httpErrorService = inject(HttpErrorService);
  private notificationService = inject(NotificationService);
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Connexion réussie ! Bienvenue.');
        // Return to the page the user originally tried to reach, if any
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.httpErrorService.getAuthMessage(error, 'login');
        this.notificationService.error(this.errorMessage);
      }
    });
  }
}
