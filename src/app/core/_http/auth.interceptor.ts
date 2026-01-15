import {
    HttpErrorResponse,
    HttpInterceptorFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { AuthStateService } from '../_auth/auth-state.service';
import { RefreshManagerService } from '../_auth/refresh-manager.service';
import { willExpireWithinMs } from '../_auth/jwt.util';
import { apiConfig } from '../_config/apiConfig';

const REFRESH_WINDOW_MS = 30_000;

function isAuthEndpoint(url: string) {
    return url.includes(apiConfig.login) || url.includes(apiConfig.refresh) || url.includes(apiConfig.logout);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const state = inject(AuthStateService);
    const refreshMgr = inject(RefreshManagerService);

    // Don't intercept auth endpoints (avoid loops)
    if (isAuthEndpoint(req.url)) return next(req);

    const token = state.accessToken;

    const attachToken = (r: HttpRequest<any>, t: string | null) =>
        t ? r.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : r;

    // If no token, just continue (backend may allow anonymous)
    if (!token) return next(req);

    // Proactive refresh if expiring soon
    const needsRefresh = willExpireWithinMs(token, REFRESH_WINDOW_MS);

    const proceed$ = (t: string) => next(attachToken(req, t));

    return (needsRefresh ? refreshMgr.refreshOnce() : of(token)).pipe(
        switchMap((t) => proceed$(t)),
        catchError((err: unknown) => {
            // Optional: if access token invalid/expired (401), attempt refresh once then retry
            if (err instanceof HttpErrorResponse && err.status === 401) {
                return refreshMgr.refreshOnce().pipe(
                    switchMap((t) => next(attachToken(req, t))),
                    catchError((e) => throwError(() => e))
                );
            }
            return throwError(() => err);
        })
    );
};