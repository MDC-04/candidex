import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Data passed to the confirm dialog
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string; // default "Confirm"
  cancelText?: string;  // default "Cancel"
  confirmColor?: 'primary' | 'accent' | 'warn'; // default "primary"
}

/**
 * Reusable confirmation dialog component
 * 
 * Usage:
 * ```typescript
 * const dialogRef = this.dialog.open(ConfirmDialogComponent, {
 *   data: {
 *     title: 'Delete Application',
 *     message: 'Are you sure you want to delete this application?',
 *     confirmText: 'Delete',
 *     confirmColor: 'warn'
 *   }
 * });
 * 
 * dialogRef.afterClosed().subscribe(confirmed => {
 *   if (confirmed) {
 *     // User confirmed
 *   }
 * });
 * ```
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set defaults
    this.data.confirmText = this.data.confirmText || 'Confirm';
    this.data.cancelText = this.data.cancelText || 'Cancel';
    this.data.confirmColor = this.data.confirmColor || 'primary';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
