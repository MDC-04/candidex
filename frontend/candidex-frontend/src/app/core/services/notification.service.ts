import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private defaultConfig: MatSnackBarConfig = {
    duration: 3600,
    horizontalPosition: 'center',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 5200);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warning(message: string): void {
    this.show('warning', message, 4500);
  }

  private show(type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number): void {
    const icon = this.getIcon(type);
    const position = this.getResponsivePosition();

    this.snackBar.open(`${icon} ${message}`, 'Fermer', {
      ...this.defaultConfig,
      ...position,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: ['cx-snackbar', `cx-snackbar-${type}`]
    });
  }

  private getResponsivePosition(): Pick<MatSnackBarConfig, 'horizontalPosition' | 'verticalPosition'> {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

    return {
      horizontalPosition: 'center',
      verticalPosition: isMobile ? 'bottom' : 'top'
    };
  }

  private getIcon(type: 'success' | 'error' | 'info' | 'warning'): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'i';
    }
  }
}
