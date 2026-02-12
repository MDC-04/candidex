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
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Créer un compte</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom complet</mat-label>
              <input matInput formControlName="fullName" required placeholder="Entrez votre nom complet">
              @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.hasError('required')) {
                <mat-error>Le nom complet est requis</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required placeholder="votre.email@exemple.com">
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('required')) {
                <mat-error>L'email est requis</mat-error>
              }
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('email')) {
                <mat-error>Veuillez entrer une adresse email valide</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" required placeholder="Min. 8 caractères">
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('required')) {
                <mat-error>Le mot de passe est requis</mat-error>
              }
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Le mot de passe doit contenir au moins 8 caractères</mat-error>
              }
            </mat-form-field>

            <div class="section-divider">
              <span>Informations professionnelles (Optionnel)</span>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Poste actuel</mat-label>
              <mat-icon matIconPrefix>work_outline</mat-icon>
              <input matInput formControlName="currentPosition" placeholder="ex: Ingénieur logiciel">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Entreprise / École</mat-label>
              <mat-icon matIconPrefix>business</mat-icon>
              <input matInput formControlName="company" placeholder="ex: Tech Corp">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Localisation</mat-label>
              <mat-icon matIconPrefix>location_on</mat-icon>
              <input matInput formControlName="location" placeholder="ex: Paris, France">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Téléphone</mat-label>
              <mat-icon matIconPrefix>phone</mat-icon>
              <input matInput formControlName="phone" placeholder="ex: +33 6 12 34 56 78">
            </mat-form-field>
            
            @if (errorMessage) {
              <div class="error-message">{{ errorMessage }}</div>
            }
            
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="registerForm.invalid || loading" class="full-width">
              @if (!loading) { <span>S'inscrire</span> }
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
            </button>
          </form>
          
          <div class="login-link">
            Vous avez déjà un compte ? <a routerLink="/auth/login">Se connecter</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 0;
    }
    
    .register-card {
      width: 100%;
      max-width: 500px;
      margin: 20px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .section-divider {
      margin: 24px 0 16px;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-divider span {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .error-message {
      color: #f44336;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }
    
    .login-link a {
      color: #667eea;
      text-decoration: none;
    }
    
    mat-spinner {
      margin: 0 auto;
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
