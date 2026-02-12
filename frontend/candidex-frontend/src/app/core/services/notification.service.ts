import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };
  
  constructor(private snackBar: MatSnackBar) {}
  
  success(message: string): void {
    this.snackBar.open(message, '✓', {
      ...this.defaultConfig,
      panelClass: ['success-snackbar']
    });
  }
  
  error(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  
  info(message: string): void {
    this.snackBar.open(message, 'ℹ', {
      ...this.defaultConfig,
      panelClass: ['info-snackbar']
    });
  }
  
  warning(message: string): void {
    this.snackBar.open(message, '⚠', {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar']
    });
  }
}
