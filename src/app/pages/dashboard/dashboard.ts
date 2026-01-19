import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/_auth/auth.service';
import { TokenStore } from '../../core/_auth/token.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = [
    { label: 'Total Organizations', value: '1,240', icon: 'domain', trend: '+12%', color: 'blue' },
    { label: 'Active Subscriptions', value: '856', icon: 'verified', trend: '+8%', color: 'green' },
    { label: 'System Entries', value: '142', icon: 'dns', trend: 'Predefined', color: 'purple' },
    { label: 'Pending Approvals', value: '15', icon: 'pending_actions', trend: '-2%', color: 'orange' },
  ];

  recentActivities = [
    { id: 1, user: 'TechSolutions Ltd', action: 'New Registration', time: '10:30 AM', status: 'Pending', statusColor: 'warning' },
    { id: 2, user: 'Global Systems Inc', action: 'Subscription Upgraded', time: '11:00 AM', status: 'Active', statusColor: 'success' },
    { id: 3, user: 'System Admin', action: 'Added "Network Error" Type', time: '11:15 AM', status: 'System', statusColor: 'blue' },
    { id: 4, user: 'Beta Corp', action: 'Subscription Expired', time: '11:30 AM', status: 'Expired', statusColor: 'danger' },
  ];

  private tokenStore = inject(TokenStore);
  private authService = inject(AuthService);

  ngOnInit(): void {

  }
}
