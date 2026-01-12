import { Component } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ToastService } from '../../shared_services/toast.service';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;     // ms (default 5000)
  dismissible?: boolean; // default true
}

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  toasts: ToastOptions[] = [];
  private sub?: Subscription;
  private timers = new Map<string, { sub: Subscription; remaining: number; started: number }>();
  paused = new Set<string>();

  constructor(private toast: ToastService) { }

  ngOnInit() {
    this.sub = this.toast.toasts$.subscribe(list => {
      this.toasts = list;
      // start timers for new toasts
      for (const t of list) {
        if (!t.id || !t.duration || t.duration <= 0) continue;
        if (!this.timers.has(t.id)) this.startTimer(t.id, t.duration);
      }
      // clean timers for removed
      for (const id of Array.from(this.timers.keys())) {
        if (!list.find(t => t.id === id)) this.clearTimer(id);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    for (const id of Array.from(this.timers.keys())) this.clearTimer(id);
  }

  close(id: string) { this.toast.close(id); }

  // --- timer controls (supports pause on hover) ---
  private startTimer(id: string, duration: number) {
    const started = Date.now();
    const sub = timer(duration).subscribe(() => this.close(id));
    this.timers.set(id, { sub, remaining: duration, started });
  }
  private clearTimer(id: string) {
    const t = this.timers.get(id);
    if (t) t.sub.unsubscribe();
    this.timers.delete(id);
    this.paused.delete(id);
  }
  pause(id: string) {
    const t = this.timers.get(id);
    if (!t || this.paused.has(id)) return;
    t.sub.unsubscribe();
    const elapsed = Date.now() - t.started;
    t.remaining = Math.max(0, t.remaining - elapsed);
    this.paused.add(id);
  }
  resume(id: string) {
    const t = this.timers.get(id);
    if (!t || !this.paused.has(id)) return;
    const started = Date.now();
    const sub = timer(t.remaining).subscribe(() => this.close(id));
    this.timers.set(id, { sub, remaining: t.remaining, started });
    this.paused.delete(id);
  }

  // inline SVGs (no external icon deps)
  svg(type: NonNullable<ToastOptions['type']> | 'info') {
    switch (type) {
      case 'success': return `<span class="material-symbols-rounded" style="color: #16a34a;">check_circle_unread</span>`;
      case 'warning': return `<span class="material-symbols-rounded" style="color: #d97706;">warning</span>`;
      case 'error': return `<span class="material-symbols-rounded" style="color: #dc2626;">error</span>`;
      default: return `<span class="material-symbols-rounded" style="color: #e7e7e7;">notifications</span>`;
    }
  }
}
