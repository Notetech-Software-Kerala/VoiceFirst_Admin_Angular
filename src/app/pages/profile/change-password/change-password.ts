import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { AuthService } from '../../../core/_auth/auth.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { finalize } from 'rxjs';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  form: FormGroup;
  isSubmitting = false;
  showOld = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePassword>,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = {
      oldPassword: this.form.value.oldPassword,
      newPassword: this.form.value.newPassword
    };

    this.authService.changePassword(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res: any) => {
          if (res?.statusCode === 200 || res?.success) {
            this.toastService.success('Password changed successfully', 'Success');
            this.dialogRef.close(true);
          } else {
            this.toastService.error(res?.message || 'Failed to change password', 'Error');
          }
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Failed to change password. Please try again.';
          this.toastService.error(msg, 'Error');
        }
      });
  }
}
