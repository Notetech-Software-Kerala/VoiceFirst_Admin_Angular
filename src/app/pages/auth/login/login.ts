import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BrowserDeviceService } from '../../../core/_service/browser-device.service';
import { AuthService } from '../../../core/_auth/auth.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  hidePassword = true;
  submitting = false;
  loginForm!: FormGroup;

  username = 'athul@notetech.com';
  password = '123456';
  theme: any

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private deviceService: BrowserDeviceService,
    private authService: AuthService

  ) { }




  ngOnInit() {
    this.theme = localStorage.getItem('theme');

    this.loginForm = this.fb.group({
      email: ['anil.p@notetech.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  get src() {
    if (this.theme === 'dark') return '/images/logos/voicefirst_logo_light.png';
    return '/images/logos/voicefirst_logo.png';
  }

  get f() {
    return this.loginForm.controls as any;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  // async onSubmit() {
  //   if (this.loginForm.invalid) return;
  //   this.submitting = true;
  //   console.log('Login data:', this.loginForm.value);
  //   if (this.username === this.loginForm.value.email && this.password === this.loginForm.value.password) {

  //     const device = await this.deviceService.collect();
  //     console.log('device', device);
  //     setTimeout(() => {
  //       this.submitting = false;
  //       this.router.navigate(['/dashboard']);
  //       this.toast.success(`Welcome to Voice First`, { title: 'Login Success' });
  //     }, 1000);
  //   }
  //   else {
  //     setTimeout(() => {
  //       this.submitting = false;
  //       alert('Invalid credentials');
  //     }, 1000);
  //   }
  //   // simulate async login

  // }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.submitting = true;
    console.log('Login data:', this.loginForm.value);
    const payload = {
      emailOrMobile: this.loginForm.value.email,
      password: this.loginForm.value.password,
      uniqueDeviceId: "e3ee5465-e103-4200-b882-50da1c700e42"
    }
    this.authService.login(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
        this.toast.success(`Welcome to Voice First`, 'Login Success');
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(`Login failed`, 'Login Failed');
      }
    });
  }
}
