import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusItem {
  active?: boolean;
  deleted?: boolean;
}

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      {{ statusText }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid transparent;
    }

    .badge--active {
      background: #dcfce7;
      color: #15803d;
      border-color: #bbf7d0;
    }

    .badge--suspended {
      background: #fef9c3;
      color: #854d0e;
      border-color: #fde68a;
    }

    .badge--deleted {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fecaca;
    }
  `]
})
export class StatusBadge {
  @Input() item!: StatusItem;

  get statusText(): string {
    if (this.item.deleted) return 'Deleted';
    return this.item.active ? 'Active' : 'Suspended';
  }

  get badgeClass(): string {
    if (this.item.deleted) return 'badge--deleted';
    return this.item.active ? 'badge--active' : 'badge--suspended';
  }
}
