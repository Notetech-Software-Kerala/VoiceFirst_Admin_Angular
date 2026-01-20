import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialog } from '../shared_modules/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private dialog: MatDialog) { }

  /**
   * Show a delete confirmation dialog
   * @param itemName Name of the item being deleted
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirmDelete(itemName: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      panelClass: 'modern-confirm-panel',
      autoFocus: false,
      data: {
        icon: 'delete',
        tone: 'warn',
        title: 'Delete Item',
        message: `Are you sure you want to delete "${itemName}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    });

    return dialogRef.afterClosed().pipe(
      map(result => !!result) // Convert to boolean
    );
  }

  /**
   * Generic confirmation dialog
   * @param title Dialog title
   * @param message Confirmation message
   * @param confirmText Confirm button text (default: 'Confirm')
   * @param cancelText Cancel button text (default: 'Cancel')
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      panelClass: 'modern-confirm-panel',
      autoFocus: false,
      data: {
        icon: 'warning',
        tone: 'accent',
        title,
        message,
        confirmText,
        cancelText,
      }
    });

    return dialogRef.afterClosed().pipe(
      map(result => !!result)
    );
  }
}
