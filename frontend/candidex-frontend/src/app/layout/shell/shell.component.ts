import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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
    MatTooltipModule,
    ConfirmDialogComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  isMobileViewport = false;
  mobileSidenavOpened = false;
  isHomeRoute = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
    ,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateViewportState();
    this.isHomeRoute = this.router.url.split('?')[0] === '/home';
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.isHomeRoute = e.urlAfterRedirects.split('?')[0] === '/home';
      });
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmer la déconnexion',
        message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        confirmText: 'Se déconnecter',
        cancelText: 'Annuler',
        confirmColor: 'warn'
      }
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
