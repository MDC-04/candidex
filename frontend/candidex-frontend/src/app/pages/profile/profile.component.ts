import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserProfile } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  
  profileForm: FormGroup;
  loading = false;
  saving = false;
  profile: UserProfile | null = null;
  
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  
  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      currentPosition: [''],
      company: [''],
      location: [''],
      phone: [''],
      bio: ['', Validators.maxLength(500)],
      linkedinUrl: [''],
      portfolioUrl: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadProfile();
  }
  
  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          fullName: profile.fullName || '',
          currentPosition: profile.currentPosition || '',
          company: profile.company || '',
          location: profile.location || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          linkedinUrl: profile.linkedinUrl || '',
          portfolioUrl: profile.portfolioUrl || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Échec du chargement du profil');
        this.loading = false;
      }
    });
  }
  
  onSave(): void {
    if (this.profileForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.saving = false;
        this.notificationService.success('Profil mis à jour avec succès !');
      },
      error: (error) => {
        this.notificationService.error('Échec de la mise à jour du profil');
        this.saving = false;
      }
    });
  }
  
  onCancel(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName || '',
        currentPosition: this.profile.currentPosition || '',
        company: this.profile.company || '',
        location: this.profile.location || '',
        phone: this.profile.phone || '',
        bio: this.profile.bio || '',
        linkedinUrl: this.profile.linkedinUrl || '',
        portfolioUrl: this.profile.portfolioUrl || ''
      });
    }
  }
}
