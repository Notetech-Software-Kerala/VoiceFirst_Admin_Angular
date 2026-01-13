import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';

@Component({
  selector: 'app-forgot-paassword',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-paassword.html',
  styleUrl: './forgot-paassword.css',
})
export class ForgotPaassword implements OnInit {
  step = 1;
  submitting = false;

  emailForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  theme: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.theme = localStorage.getItem('theme');

    // Step 1: Email/Phone
    this.emailForm = this.fb.group({
      email: ['', [Validators.required]] // Could add email/phone specific regex if needed, keeping simple for now
    });

    // Step 2: OTP
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

    // Step 3: New Password
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get src() {
    if (this.theme === 'dark') return '/images/logos/voicefirst_logo_light.png';
    return '/images/logos/voicefirst_logo.png';
  }

  get fEmail() { return this.emailForm.controls; }
  get fOtp() { return this.otpForm.controls; }
  get fReset() { return this.resetForm.controls; }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Step 1 Submit
  onSubmitEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.submitting = true;

    // Simulate API
    setTimeout(() => {
      this.submitting = false;
      this.step = 2;
      this.toast.success('OTP sent to your email/phone', { title: 'OTP Sent' });
    }, 1000);
  }

  // Step 2 Submit
  onSubmitOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.submitting = true;

    // Simulate API
    setTimeout(() => {
      this.submitting = false;
      this.step = 3;
      this.toast.success('OTP Verified', { title: 'Success' });
    }, 1000);
  }

  // Step 3 Submit
  onSubmitReset() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.submitting = true;

    // Simulate API
    setTimeout(() => {
      this.submitting = false;
      this.toast.success('Password reset successfully. Please login.', { title: 'Success' });
      this.router.navigate(['/login']);
    }, 1500);
  }

  resendOtp() {
    this.toast.success('OTP has been resent', { title: 'Resent' });
  }
}
