// src/app/auth/auth.interceptor.ts
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../_auth/auth.service';
import { apiConfig } from '../_config/apiConfig';

const isRefreshing$ = new BehaviorSubject<boolean>(false);
const refreshedToken$ = new BehaviorSubject<string | null>(null);

function isAuthFreeEndpoint(url: string): boolean {
    return (
        url.includes(apiConfig.login) ||
        url.includes(apiConfig.refresh) ||
        url.includes(apiConfig.logout)
    );
}

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const auth = inject(AuthService);

    // Always send cookies (needed for refresh cookie)
    let request = req.clone({ withCredentials: true });

    // ✅ DO NOT attach Authorization for login/refresh/logout
    if (!isAuthFreeEndpoint(request.url)) {
        const token = auth.getAccessToken();
        if (token) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }
    }

    return next(request).pipe(
        catchError((err: unknown) => {
            if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
            if (err.status !== 401) return throwError(() => err);

            // ✅ If refresh/login itself fails, stop
            if (isAuthFreeEndpoint(request.url)) {
                auth.clearSession();
                return throwError(() => err);
            }

            // If refresh in progress, wait and retry
            if (isRefreshing$.value) {
                return refreshedToken$.pipe(
                    filter((t): t is string => !!t),
                    take(1),
                    switchMap((newToken) => {
                        const retryReq = request.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    })
                );
            }

            // Start refresh
            isRefreshing$.next(true);
            refreshedToken$.next(null);

            return auth.refresh().pipe(
                switchMap((newToken) => {
                    refreshedToken$.next(newToken);

                    const retryReq = request.clone({
                        setHeaders: { Authorization: `Bearer ${newToken}` }
                    });
                    return next(retryReq);
                }),
                catchError((refreshErr) => {
                    auth.clearSession();
                    return throwError(() => refreshErr);
                }),
                finalize(() => isRefreshing$.next(false))
            );
        })
    );
};
