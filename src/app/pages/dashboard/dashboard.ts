import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/_auth/auth.service';
import { TokenStore } from '../../core/_auth/token.store';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  currentDate = new Date();

  stats = [
    { label: 'Active Employees', value: '145', icon: 'group', trend: '+5%', color: 'blue' },
    { label: 'Active Programs', value: '34', icon: 'event_note', trend: '+12%', color: 'green' },
    { label: 'Open Issues', value: '12', icon: 'error', trend: '-3%', color: 'orange' },
    { label: 'Active Plans', value: '5', icon: 'card_membership', trend: 'Stable', color: 'purple' },
  ];

  criticalIssues = [
    { id: 1, title: 'Payment Gateway Timeout', module: 'Subscriptions', time: '10:30 AM', status: 'Critical', statusColor: 'danger', icon: 'payment' },
    { id: 2, title: 'Unable to load Program X data', module: 'Programs', time: '11:00 AM', status: 'High', statusColor: 'warning', icon: 'bug_report' },
    { id: 3, title: 'User role permission denied', module: 'Roles', time: '11:15 AM', status: 'Medium', statusColor: 'blue', icon: 'lock' },
    { id: 4, title: 'Database sync delayed', module: 'System', time: '11:30 AM', status: 'High', statusColor: 'warning', icon: 'sync_problem' },
  ];

  private tokenStore = inject(TokenStore);
  private authService = inject(AuthService);

  public chartOptions: any;
  private observer!: MutationObserver;

  ngOnInit(): void {
    const isDark = document.body.classList.contains('dark-theme');
    this.initChart(isDark);

    // Watch for theme changes driven by base-layout
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const currentlyDark = document.body.classList.contains('dark-theme');
          this.updateChartTheme(currentlyDark);
        }
      });
    });
    this.observer.observe(document.body, { attributes: true });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  initChart(isDark: boolean): void {
    this.chartOptions = {
      series: [
        { name: 'Raised', data: [12, 18, 15, 22, 14, 28, 20] },
        { name: 'Resolved', data: [10, 16, 12, 20, 14, 25, 18] }
      ],
      chart: {
        type: 'area',
        height: 280,
        fontFamily: 'inherit',
        toolbar: { show: false },
        background: 'transparent'
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: ['#dc2626', '#16a34a'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
      },
      grid: {
        borderColor: isDark ? '#334155' : '#e5e7eb',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      legend: { position: 'top', horizontalAlign: 'right' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      }
    };
  }

  updateChartTheme(isDark: boolean): void {
    if (!this.chartOptions) return;
    
    // Spread object to trigger Angular change detection on ng-apexcharts
    this.chartOptions = {
        ...this.chartOptions,
        theme: { mode: isDark ? 'dark' : 'light' },
        xaxis: {
            ...this.chartOptions.xaxis,
            labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
        },
        yaxis: {
            ...this.chartOptions.yaxis,
            labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
        },
        grid: {
            ...this.chartOptions.grid,
            borderColor: isDark ? '#334155' : '#e5e7eb'
        }
    };
  }
}
