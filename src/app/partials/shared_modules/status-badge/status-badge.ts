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
  styleUrls: ['./status-badge.css']
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
