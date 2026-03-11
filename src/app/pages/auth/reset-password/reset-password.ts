import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/_auth/auth.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  resetForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  theme!: string;

  submitting = false;
  resetVisible = false;

  resetToken = '';
  emailForResend = '';

  emailMode = false;
  tokenMode = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    this.theme = localStorage.getItem('theme') || 'light';
    localStorage.setItem('theme', this.theme);

    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.activatedRoute.paramMap.subscribe(pathParams => {
      const token = pathParams.get('token');

      console.log("TOKEN", token);


      this.activatedRoute.queryParamMap.subscribe(queryParams => {
        const encryptedEmail = queryParams.get('email');

        this.emailMode = false;
        this.tokenMode = false;
        this.resetVisible = false;

        if (encryptedEmail) {
          const decryptedEmail = this.encryptionService.decryptFromRoute(encryptedEmail);
          if (decryptedEmail) {
            this.emailForResend = decryptedEmail;
            this.emailMode = true;
          }
        }

        if (token) {
          this.resetToken = token;
          this.tokenMode = true;
          this.checkTokenValidity(token);
        }
      });
    });
  }

  get src() {
    return this.theme === 'dark'
      ? '/images/logos/voicefirst_logo_light.png'
      : '/images/logos/voicefirst_logo.png';
  }

  get fReset() {
    return this.resetForm.controls;
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  resendEmail() {
    if (!this.emailForResend) {
      this.toast.error('Email address not found. Please try requesting a new link.', 'Error');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.authService.forgotPassword({ email: this.emailForResend }).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.toast.success('Email resent successfully', 'Success');
        } else {
          this.toast.error(res.message || 'Failed to resend email', 'Error');
        }
      },
      error: () => {
        this.toast.error('Failed to resend email', 'Error');
      }
    });
  }

  requestLink() {
    this.router.navigate(['/forgot-password']);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  checkTokenValidity(token: string) {
    this.authService.validateResetToken(token).subscribe({
      next: (res: any) => {
        console.log("VALIDATION", res);

        if (res.statusCode === 200) {
          this.resetVisible = true;
        } else {
          this.resetVisible = false;
          this.router.navigate(['/link-expired']);
        }
      },
      error: (err) => {
        console.log("ERROR", err);

        this.resetVisible = false;
        this.router.navigate(['/link-expired']);
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      passwordResetGrant: this.resetToken,
      newPassword: this.fReset['confirmPassword'].value
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;

        if (res.statusCode === 200) {
          this.toast.success('Password reset successfully', 'Success');
          this.router.navigate(['/login']);
        } else {
          this.toast.error(res.message || 'Failed to reset password', 'Error');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err?.error?.message || 'Failed to reset password', 'Error');
      }
    });
  }
}