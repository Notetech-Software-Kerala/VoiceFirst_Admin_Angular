import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { AuthService } from '../../core/_auth/auth.service';
import { UserInfo } from '../../core/_auth/auth.model';
import { MatDialog } from '@angular/material/dialog';
import { ChangePassword } from './change-password/change-password';
import { EditProfile } from './edit-profile/edit-profile';
import { UserService } from '../../core/_state/user/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any | null = null;
  isLoading = true;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.isLoading = false;
        console.log('User Profile loaded:', this.user);
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.isLoading = false;
      }
    });
  }

  get fullName(): string {
    if (!this.user) return 'User';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  get initials(): string {
    if (!this.user) return 'U';
    const first = this.user.firstName?.[0] ?? '';
    const last = this.user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  }

  get primaryRole(): string {
    if (!this.user || !this.user.roles || this.user.roles.length === 0) return 'User';
    return this.user.roles[0];
  }

  openEditProfile(): void {
    const dialogRef = this.dialog.open(EditProfile, {
      width: '600px',
      data: this.user,
      disableClose: true,
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      // If result is true, the profile was updated successfully
      if (result) {
        this.isLoading = true;
        this.ngOnInit(); // Re-fetch the user details
      }
    });
  }

  openChangePassword(): void {
    this.dialog.open(ChangePassword, {
      width: '440px',
      disableClose: true,
      panelClass: 'custom-dialog-panel'
    });
  }
}

