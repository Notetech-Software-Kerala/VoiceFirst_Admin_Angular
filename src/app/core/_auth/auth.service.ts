// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { TokenStore } from './token.store';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginData, LoginRequest, RefreshData, UserInfo } from './auth.model';
import { apiConfig } from '../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = environment.baseUrl;

    private userSubject = new BehaviorSubject<UserInfo | null>(null);
    user$ = this.userSubject.asObservable();

    private refreshTokenTimeout: any;

    // ✅ prevents multiple simultaneous refresh calls (timer + interceptor + guards)
    private refreshInFlight?: Observable<string>;

    constructor(
        private http: HttpClient,
        private tokenStore: TokenStore,
        private router: Router
    ) {
        // Restore from localStorage (access token only)
        const token = this.tokenStore.getToken();

        if (token) {
            this.restoreUserFromToken(token);

            // If token is near expiry, try refresh immediately (cookie-based)
            if (this.tokenStore.isExpiredOrNearExpiry()) {
                this.refresh().subscribe({
                    error: () => this.clearSession()
                });
            } else {
                this.startRefreshTokenTimer();
            }
        }
    }

    /** -----------------------------
     *  Session / User restore helpers
     *  ----------------------------- */

    private restoreUserFromToken(accessToken: string) {
        const tokenData = this.decodeJwt(accessToken);

        this.userSubject.next({
            userId: Number(tokenData.sub) || 0,
            firstName: tokenData.firstName || '',
            lastName: tokenData.lastName || '',
            email: tokenData.email || '',
            mobileNo: tokenData.mobileNo || ''
        });
    }

    private setSession(accessToken: string, expiresAtUtcIso: string) {
        // Persist token + expiry
        this.tokenStore.set(accessToken, expiresAtUtcIso);

        // Update user subject
        this.restoreUserFromToken(accessToken);

        // Restart proactive refresh timer
        this.startRefreshTokenTimer();
    }

    private decodeJwt(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return {};

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('[AuthService] Failed to decode JWT', e);
            return {};
        }
    }

    /** -----------------------------
     *  Proactive refresh timer
     *  ----------------------------- */

    private startRefreshTokenTimer() {
        const expiresAtMs = this.tokenStore.getExpiresAtUtcMs();
        if (!expiresAtMs) return;

        const now = Date.now();
        // refresh 30 seconds before expiry
        const timeoutMs = (expiresAtMs - now) - 30_000;

        this.stopRefreshTokenTimer();

        if (timeoutMs <= 0) {
            // already expired / very close -> refresh now
            this.refresh().subscribe({
                error: () => this.clearSession()
            });
            return;
        }

        this.refreshTokenTimeout = setTimeout(() => {
            this.refresh().subscribe({
                error: () => this.clearSession()
            });
        }, timeoutMs);
    }

    private stopRefreshTokenTimer() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }

    /** -----------------------------
     *  Public API
     *  ----------------------------- */

    // ✅ must include withCredentials so refresh cookie can be stored
    login(req: LoginRequest): Observable<UserInfo> {
        return this.http
            .post<ApiResponse<LoginData>>(`${this.base}${apiConfig.login}`, req, {
                withCredentials: true
            })
            .pipe(
                tap(res => this.setSession(res.data.accessToken, res.data.accessTokenExpiresAtUtc)),
                map(() => this.userSubject.value as UserInfo)
            );
    }

    /**
     * ✅ Refresh token call: backend validates HttpOnly cookie and returns new access token.
     * Must use withCredentials so browser sends refresh cookie.
     * Also guarded so multiple calls collapse into one.
     */
    refresh(): Observable<string> {
        console.log("Refresh token working");

        if (this.refreshInFlight) return this.refreshInFlight;

        this.refreshInFlight = this.http
            .post<ApiResponse<RefreshData>>(`${this.base}${apiConfig.refresh}`, {}, {
                withCredentials: true
            })
            .pipe(
                tap(res => this.setSession(res.data.accessToken, res.data.accessTokenExpiresAtUtc)),
                map(res => res.data.accessToken),
                finalize(() => (this.refreshInFlight = undefined))
            );

        console.log("Refresh In flight", this.refreshInFlight);


        return this.refreshInFlight;
    }

    // ✅ withCredentials so backend can clear/blacklist refresh cookie
    logout(): Observable<void> {
        return this.http
            .post(`${this.base}${apiConfig.logout}`, {}, { withCredentials: true })
            .pipe(
                tap(() => this.clearSession()),
                map(() => void 0),
                catchError(err => {
                    // Even if logout fails, clear local session (best-effort)
                    this.clearSession();
                    return throwError(() => err);
                })
            );
    }

    /**
     * Call on app start (e.g., APP_INITIALIZER):
     * - If access token exists and not near expiry -> ok
     * - Else try refresh once -> ok if cookie valid
     */
    bootstrapSession(): Observable<boolean> {
        const token = this.getAccessToken();
        if (token && !this.isTokenExpiredOrNearExpiry()) return of(true);

        return this.refresh().pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    getAccessToken(): string | null {
        return this.tokenStore.getToken();
    }

    isTokenExpiredOrNearExpiry(): boolean {
        return this.tokenStore.isExpiredOrNearExpiry();
    }

    clearSession() {
        this.stopRefreshTokenTimer();
        this.refreshInFlight = undefined;
        this.tokenStore.clear();
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }
}