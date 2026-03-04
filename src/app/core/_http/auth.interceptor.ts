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

function isAuthFreeEndpoint(url: string): boolean {
    return (
        url.includes(apiConfig.login) ||
        url.includes(apiConfig.refresh)
    );
}

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const auth = inject(AuthService);

    // Always send cookies
    let request = req.clone({ withCredentials: true });

    // ✅ DO NOT attach Authorization for login
    if (!isAuthFreeEndpoint(request.url)) {
        const token = auth.getAccessToken();
        if (token) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });

            console.log("request with headers", request);

        }
    }

    return next(request).pipe(
        catchError((err: unknown) => {
            if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

            // If it's a 401, the proactive timer hasn't fired or the token is fundamentally invalid.
            if (err.status === 401) {
                console.warn('[Interceptor] 401 Unauthorized encountered. Clearing session.');
                auth.clearSession();
            }

            return throwError(() => err);
        })
    );
};
