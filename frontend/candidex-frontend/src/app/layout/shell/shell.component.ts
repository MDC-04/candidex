import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LogoutConfirmComponent } from '../../shared/components/logout-confirm/logout-confirm.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule, 
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    MatTooltipModule
    ,
    LogoutConfirmComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  currentUser$ = this.authService.currentUser$;
  
  constructor(
    private authService: AuthService,
    private router: Router
    ,
    private dialog: MatDialog
  ) {}
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  openLogoutConfirm(): void {
    const dialogRef = this.dialog.open(LogoutConfirmComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.logout();
      }
    });
  }
  
  getInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }
}
