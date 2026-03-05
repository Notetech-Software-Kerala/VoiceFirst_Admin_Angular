import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../_auth/auth.service';
import { apiConfig } from '../_config/apiConfig';

function isAuthFreeEndpoint(url: string): boolean {
    return (
        url.includes(apiConfig.login) ||
        url.includes(apiConfig.refresh)
    );
}

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const auth = inject(AuthService);

    // always send cookies
    let request = req.clone({ withCredentials: true });

    // attach bearer only for normal endpoints
    if (!isAuthFreeEndpoint(request.url)) {
        const token = auth.getAccessToken();
        if (token) {
            request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
    }

    return next(request).pipe(
        catchError((err: unknown) => {
            if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

            // only handle 401 for normal endpoints (NOT refresh/login/logout)
            if (err.status !== 401 || isAuthFreeEndpoint(request.url)) {
                return throwError(() => err);
            }

            // If a refresh is already running, wait for it then retry
            if (isRefreshing) {
                return refreshSubject.pipe(
                    filter(t => !!t),
                    take(1),
                    switchMap(() => {
                        const newToken = auth.getAccessToken();
                        const retried = newToken
                            ? request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                            : request;
                        return next(retried);
                    })
                );
            }

            // start refresh
            isRefreshing = true;
            refreshSubject.next(null);

            return auth.refresh().pipe(
                switchMap((newToken) => {
                    isRefreshing = false;
                    refreshSubject.next(newToken);

                    const retried = request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                    return next(retried);
                }),
                catchError((refreshErr) => {
                    isRefreshing = false;
                    refreshSubject.next(null);

                    // refresh failed (expired/invalid) => logout locally
                    auth.clearSession();

                    // optional: best-effort logout call (don’t block navigation on it)
                    // auth.logout().subscribe({ error: () => {} });

                    return throwError(() => refreshErr);
                })
            );
        })
    );
};