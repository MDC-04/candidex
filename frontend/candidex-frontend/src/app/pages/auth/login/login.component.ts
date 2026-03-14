import { Component, inject } from '@angular/core';
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
    <div class="auth-page">
      <!-- Logo -->
      <div class="logo-section">
        <img src="candidex_logo.png" alt="Candidex" class="logo-img">
      </div>

      <!-- Login Card -->
      <div class="auth-card">
        <h2 class="auth-title">Bon retour !</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input 
              type="email" 
              class="form-input"
              formControlName="email" 
              placeholder="ex. jean.dupont@exemple.com"
              required>
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('required')) {
              <span class="error-text">L'email est requis</span>
            }
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('email')) {
              <span class="error-text">Veuillez entrer un email valide</span>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input 
              type="password" 
              class="form-input"
              formControlName="password" 
              placeholder="Entrez votre mot de passe"
              required>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
              <span class="error-text">Le mot de passe est requis</span>
            }
          </div>

          <a routerLink="/auth/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
          
          @if (errorMessage) {
            <div class="error-message">{{ errorMessage }}</div>
          }
          
          <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || loading">
            @if (!loading) { <span>Connexion</span> }
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
          </button>
        </form>
        
        <div class="switch-auth">
          Pas de compte ? <a routerLink="/auth/register" class="switch-link">S'inscrire</a>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <h3 class="features-title">Fonctionnalités de Candidex</h3>
        <ul class="features-list">
          <li>Gérez efficacement vos candidatures avec notre tableau de bord complet.</li>
          <li>Suivez votre progression avec la vue pipeline Kanban.</li>
          <li>Vues détaillées de chaque candidature pour rester informé.</li>
          <li>Interface sécurisée et facile à utiliser conçue pour la productivité.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      background: url('/candidex_logo_wallpaper.png') center/cover no-repeat fixed;
      background-color: #5b6abf;
    }

    .logo-section {
      display: none;
    }

    .logo-img {
      height: 160px;
      width: auto;
      object-fit: contain;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: #eaedfa;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
    }

    .auth-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 32px 0;
      text-align: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: none;
      border-radius: 12px;
      background: #ffffff;
      font-size: 15px;
      color: #1e293b;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .form-input::placeholder {
      color: #a0a0b8;
    }

    .form-input:focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .error-text {
      font-size: 13px;
      color: #ef4444;
    }

    .forgot-link {
      font-size: 14px;
      color: #667eea;
      text-decoration: none;
      margin-top: -8px;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .error-message {
      padding: 12px;
      background: #fee2e2;
      border-radius: 8px;
      color: #ef4444;
      font-size: 14px;
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      padding: 16px;
      background: #1a1a1a;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2a2a2a;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .switch-auth {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #1a1a1a;
    }

    .switch-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .switch-link:hover {
      text-decoration: underline;
    }

    .features-section {
      width: 100%;
      max-width: 600px;
      margin-top: 64px;
      text-align: center;
    }

    .features-title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 24px 0;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .features-list li {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      padding-left: 24px;
      position: relative;
    }

    .features-list li::before {
      content: '-';
      position: absolute;
      left: 0;
      color: #ffffff;
      font-weight: 600;
    }

    mat-spinner {
      margin: 0 auto;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 32px 24px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  
  private notificationService = inject(NotificationService);
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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
        // Redirect to Home after login
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = error.error?.message || 'Échec de la connexion. Veuillez réessayer.';
        }
        this.notificationService.error(this.errorMessage);
      }
    });
  }
}
