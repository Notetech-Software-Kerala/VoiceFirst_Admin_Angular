import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;          // e.g. 'delete', 'warning', 'logout'
  tone?: 'warn'|'accent'|'neutral';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
     
  
  constructor(
    public ref: MatDialogRef<ConfirmDialog, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm() { this.ref.close(true); }
  onCancel()  { this.ref.close(false); }

  get tone(): 'warn'|'accent'|'neutral' { return this.data.tone ?? 'warn'; }
}
