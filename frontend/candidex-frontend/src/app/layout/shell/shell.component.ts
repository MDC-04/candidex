import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
    RouterLinkActive,
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
export class ShellComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  isMobileViewport = false;
  mobileSidenavOpened = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
    ,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateViewportState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportState();
  }
  
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

  toggleSidenav(): void {
    if (!this.isMobileViewport) {
      return;
    }
    this.mobileSidenavOpened = !this.mobileSidenavOpened;
  }

  onNavItemClick(): void {
    if (this.isMobileViewport) {
      this.mobileSidenavOpened = false;
    }
  }

  onSidenavClosed(): void {
    if (this.isMobileViewport) {
      this.mobileSidenavOpened = false;
    }
  }

  private updateViewportState(): void {
    const nextIsMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches;

    if (nextIsMobile !== this.isMobileViewport) {
      this.isMobileViewport = nextIsMobile;
      this.mobileSidenavOpened = false;
    }
  }
}
