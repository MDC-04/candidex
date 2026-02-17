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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  
  profileForm: FormGroup;
  loading = false;
  saving = false;
  profile: UserProfile | null = null;
  uploadedCvName: string | null = null;
  uploadedCvFile: File | null = null;
  uploadingCv = false;
  
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  
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
        // Load CV filename from profile
        if (profile.cvOriginalFilename) {
          this.uploadedCvName = profile.cvOriginalFilename;
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Échec du chargement du profil');
        this.loading = false;
      }
    });
  }

  private loadCvFromLocalStorage(): void {
    // No longer needed - CV is loaded from backend
  }

  private saveCvToLocalStorage(): void {
    // No longer needed - CV is saved to backend
  }

  private removeCvFromLocalStorage(): void {
    // No longer needed - CV is removed from backend
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.notificationService.error('Le fichier est trop volumineux. Taille maximum : 5 MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Format de fichier non accepté. Utilisez PDF, DOC ou DOCX');
        return;
      }

      this.uploadedCvFile = file;
      
      // Upload immediately to backend
      this.uploadingCv = true;
      this.userService.uploadCv(file).subscribe({
        next: (response) => {
          this.uploadedCvName = file.name;
          this.uploadingCv = false;
          this.notificationService.success(response.message);
        },
        error: (error) => {
          this.uploadedCvFile = null;
          this.uploadingCv = false;
          this.notificationService.error(error.error?.error || 'Erreur lors de l\'upload du CV');
        }
      });
    }
  }

  removeCv(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer le CV',
        message: `Êtes-vous sûr de vouloir supprimer le CV "${this.uploadedCvName || ''}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      
      this.userService.deleteCv().subscribe({
        next: () => {
          this.uploadedCvFile = null;
          this.uploadedCvName = null;
          this.notificationService.success('CV supprimé');
        },
        error: () => {
          this.notificationService.error('Erreur lors de la suppression du CV');
        }
      });
    });
  }

  viewCv(): void {
    if (this.uploadedCvFile) {
      // View the just-uploaded file (before page refresh)
      const url = URL.createObjectURL(this.uploadedCvFile);
      window.open(url, '_blank');
    } else if (this.uploadedCvName) {
      // View CV from server using HttpClient (includes JWT token via interceptor)
      this.userService.getCvBlob().subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: (error) => {
          console.error('Error loading CV:', error);
          this.notificationService.error('Erreur lors de l\'ouverture du CV');
        }
      });
    }
  }
}
