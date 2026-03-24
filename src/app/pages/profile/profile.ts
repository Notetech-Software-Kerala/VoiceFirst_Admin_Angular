import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { AuthService } from '../../core/_auth/auth.service';
import { UserInfo } from '../../core/_auth/auth.model';
import { MatDialog } from '@angular/material/dialog';
import { ChangePassword } from './change-password/change-password';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: UserInfo | null = null;

  // Demo / static extra profile details
  profileDetails = {
    department: 'Technology',
    designation: 'Software Engineer',
    employeeId: 'EMP-001',
    joinDate: '2023-01-15',
    location: 'Kochi, Kerala',
  };

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    console.log(this.user);
  }

  get fullName(): string {
    if (!this.user) return 'User';
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }

  get initials(): string {
    if (!this.user) return 'U';
    const first = this.user.firstName?.[0] ?? '';
    const last = this.user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  }

  openChangePassword(): void {
    this.dialog.open(ChangePassword, {
      width: '440px',
      disableClose: true,
      panelClass: 'custom-dialog-panel'
    });
  }
}
