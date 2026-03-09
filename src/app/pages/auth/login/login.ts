import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BrowserDeviceService } from '../../../core/_service/browser-device.service';
import { AuthService } from '../../../core/_auth/auth.service';
import { APP_VERSION } from '../../../../environments/version';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  APP_VERSION = '1';

  hidePassword = true;
  submitting = false;
  loginForm!: FormGroup;

  username = 'anil.p@notetech.com';
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
      email: ['richardantony737@gmail.com', [Validators.required, Validators.email]],
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

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.submitting = true;

    try {
      let rawDevice;

      try {
        rawDevice = await this.deviceService.collect();
      } catch (err) {
        console.warn('Device collection failed, continuing with fallback device info', err);
        rawDevice = {
          deviceID: `dev-${Date.now()}`,
          deviceName: 'Unknown Device',
          deviceType: 'Unknown',
          os: 'Unknown',
          osVersion: 'Unknown',
          manufacturer: 'Unknown',
          model: 'Unknown'
        };
      }

      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        clientType: 'Web',
        device: {
          deviceID: rawDevice.deviceID,
          version: this.APP_VERSION,
          deviceName: rawDevice.deviceName,
          deviceType: rawDevice.deviceType,
          os: rawDevice.os,
          osVersion: rawDevice.osVersion,
          manufacturer: rawDevice.manufacturer,
          model: rawDevice.model
        }
      };

      this.authService.login(payload).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard']);
          this.toast.success('Welcome to Voice First', 'Login Success');
        },
        error: (err) => {
          console.error('Login failed', err);
          this.submitting = false;
        }
      });
    } catch (e) {
      console.error('Failed before login request', e);
      this.submitting = false;
    }
  }
}
