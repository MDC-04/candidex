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
    <div class="auth-page">
      <!-- Logo -->
      <div class="logo-section">
        <img src="candidex_logo.png" alt="Candidex" class="logo-img">
      </div>

      <!-- Register Card -->
      <div class="auth-card">
        <h2 class="auth-title">Créer un compte</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input 
              type="text" 
              class="form-input"
              formControlName="fullName" 
              placeholder="Entrez votre nom complet"
              required>
            @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.hasError('required')) {
              <span class="error-text">Le nom complet est requis</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input 
              type="email" 
              class="form-input"
              formControlName="email" 
              placeholder="ex. jean.dupont@exemple.com"
              required>
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('required')) {
              <span class="error-text">L'email est requis</span>
            }
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('email')) {
              <span class="error-text">Veuillez entrer un email valide</span>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input 
              type="password" 
              class="form-input"
              formControlName="password" 
              placeholder="Min. 8 caractères"
              required>
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('required')) {
              <span class="error-text">Le mot de passe est requis</span>
            }
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
              <span class="error-text">Le mot de passe doit contenir au moins 8 caractères</span>
            }
          </div>

          <div class="section-divider">
            <span>Informations professionnelles (Optionnel)</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">Poste actuel</label>
            <input 
              type="text" 
              class="form-input"
              formControlName="currentPosition" 
              placeholder="ex: Ingénieur logiciel">
          </div>

          <div class="form-group">
            <label class="form-label">Entreprise / École</label>
            <input 
              type="text" 
              class="form-input"
              formControlName="company" 
              placeholder="ex: Tech Corp">
          </div>

          <div class="form-group">
            <label class="form-label">Localisation</label>
            <input 
              type="text" 
              class="form-input"
              formControlName="location" 
              placeholder="ex: Paris, France">
          </div>

          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input 
              type="tel" 
              class="form-input"
              formControlName="phone" 
              placeholder="ex: +33 6 12 34 56 78">
          </div>
          
          @if (errorMessage) {
            <div class="error-message">{{ errorMessage }}</div>
          }
          
          <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || loading">
            @if (!loading) { <span>S'inscrire</span> }
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
          </button>
        </form>
        
        <div class="switch-auth">
          Vous avez déjà un compte ? <a routerLink="/auth/login" class="switch-link">Se connecter</a>
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
      padding: 48px 24px 80px;
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
      max-width: 480px;
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

    .section-divider {
      margin: 8px 0;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .section-divider span {
      font-size: 13px;
      color: #666;
      font-weight: 600;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  
  private notificationService = inject(NotificationService);
  
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
  
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
    
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.notificationService.error(this.errorMessage);
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Compte créé avec succès ! Bienvenue sur Candidex.');
        this.router.navigate(['/applications']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Échec de l\'inscription. Veuillez réessayer.';
        this.notificationService.error(this.errorMessage);
      }
    });
  }
}
