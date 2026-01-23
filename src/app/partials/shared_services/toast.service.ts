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

  success(message: string, titleOrOptions?: string | Partial<ToastOptions>, o: Partial<ToastOptions> = {}) {
    return this.handleShow('success', message, titleOrOptions, o);
  }

  info(message: string, titleOrOptions?: string | Partial<ToastOptions>, o: Partial<ToastOptions> = {}) {
    return this.handleShow('info', message, titleOrOptions, o);
  }

  warning(message: string, titleOrOptions?: string | Partial<ToastOptions>, o: Partial<ToastOptions> = {}) {
    return this.handleShow('warning', message, titleOrOptions, o);
  }

  error(message: string, titleOrOptions?: string | Partial<ToastOptions>, o: Partial<ToastOptions> = {}) {
    return this.handleShow('error', message, titleOrOptions, o);
  }

  private handleShow(
    type: NonNullable<ToastOptions['type']>,
    message: string,
    titleOrOptions?: string | Partial<ToastOptions>,
    o: Partial<ToastOptions> = {}
  ) {
    let title: string | undefined;
    let options: Partial<ToastOptions> = o;

    if (typeof titleOrOptions === 'string') {
      title = titleOrOptions;
    } else if (typeof titleOrOptions === 'object') {
      options = titleOrOptions;
    }

    return this.show({ type, message, title, ...options });
  }

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
