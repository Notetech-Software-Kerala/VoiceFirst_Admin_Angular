import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { ToastOptions } from '../shared_modules/toast/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts$ = new BehaviorSubject<ToastOptions[]>([]);
  toasts$ = this._toasts$.asObservable();

  show(opts: ToastOptions) {
    const id = opts.id ?? crypto.randomUUID();
    const toast: ToastOptions = {
      duration: 2500,
      dismissible: true,
      type: 'info',
      title: this.defaultTitle(opts.type ?? 'info'),
      ...opts,
      id,
    };
    this._toasts$.next([toast, ...this._toasts$.value]); // newest on top
    return id;
  }

  success(message: string, o: Partial<ToastOptions> = {}) { return this.show({ type: 'success', message, ...o }); }
  info(message: string, o: Partial<ToastOptions> = {}) { return this.show({ type: 'info', message, ...o }); }
  warning(message: string, o: Partial<ToastOptions> = {}) { return this.show({ type: 'warning', message, ...o }); }
  error(message: string, o: Partial<ToastOptions> = {}) { return this.show({ type: 'error', message, ...o }); }

  close(id: string) {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }

  private defaultTitle(type: NonNullable<ToastOptions['type']>) {
    switch (type) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'Info';
    }
  }
}
