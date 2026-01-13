import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder, private router: Router, private toast: ToastService) { }



  ngOnInit() {
    this.theme = localStorage.getItem('theme');

    this.loginForm = this.fb.group({
      email: ['athul@notetech.com', [Validators.required, Validators.email]],
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

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.submitting = true;
    console.log('Login data:', this.loginForm.value);
    if (this.username === this.loginForm.value.email && this.password === this.loginForm.value.password) {
      setTimeout(() => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
        this.toast.success(`Welcome to Voice First`, { title: 'Login Success' });
      }, 1000);
    }
    else {
      setTimeout(() => {
        this.submitting = false;
        alert('Invalid credentials');
      }, 1000);
    }
    // simulate async login

  }
}
