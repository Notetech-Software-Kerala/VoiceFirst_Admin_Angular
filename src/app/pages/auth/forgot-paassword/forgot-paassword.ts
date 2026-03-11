import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { AuthService } from '../../../core/_auth/auth.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-forgot-paassword',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-paassword.html',
  styleUrl: './forgot-paassword.css',
})
export class ForgotPaassword implements OnInit {
  submitting = false;

  emailForm!: FormGroup;

  theme: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    this.theme = localStorage.getItem('theme');

    // Step 1: Email
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });



  }

  get src() {
    if (this.theme === 'dark') return '/images/logos/voicefirst_logo_light.png';
    return '/images/logos/voicefirst_logo.png';
  }

  get fEmail() { return this.emailForm.controls; }

  onSubmitEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    
    const payload = {
      email: this.fEmail['email'].value
    }
    this.authService.forgotPassword(payload).subscribe({
      next: (res:any) => {
        console.log(res);
        
        this.submitting = false;
        if(res.statusCode === 200){
          this.toast.success('Password reset email sent', 'Success');
          const encryptedEmail = this.encryptionService.encryptForRoute(this.fEmail['email'].value);
          this.router.navigate(['/reset-password'], { queryParams: { email: encryptedEmail } });
        }
        else {
          this.toast.error(res.message || 'Failed to send reset email', 'Error');
        }
      },
      error: (err) => {
        this.submitting = false;
      }
    });
  }



}
