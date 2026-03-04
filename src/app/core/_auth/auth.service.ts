// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap, of } from 'rxjs';
import { TokenStore } from './token.store';
import { environment } from '../../environment/environment';
import { ApiResponse, LoginData, LoginRequest, RefreshData, UserInfo } from './auth.model';
import { apiConfig } from '../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = environment.baseUrl;

    private userSubject = new BehaviorSubject<UserInfo | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private tokenStore: TokenStore, private router: Router) {
        const token = this.tokenStore.getToken();
        const expiresAtMs = this.tokenStore.getExpiresAtUtcMs();

        if (token && expiresAtMs) {
            // Restores the UserInfo subject and starts the background timer natively
            this.setSession(token, new Date(expiresAtMs).toISOString());
        }
    }


    private refreshTokenTimeout: any;

    private setSession(accessToken: string, expiresAt: string) {
        this.tokenStore.set(accessToken, expiresAt);

        // Decode JWT payload to extract user info
        let tokenData: any = {};
        try {
            const base64Url = accessToken.split('.')[1];
            if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                tokenData = JSON.parse(jsonPayload);
                console.log("Token Data", tokenData);

            }
        } catch (e) {
            console.error('Failed to parse JWT token', e);
        }

        this.userSubject.next({
            userId: Number(tokenData.sub) || 0,
            firstName: tokenData.firstName || '',
            lastName: tokenData.lastName || '',
            email: tokenData.email || '',
            mobileNo: tokenData.mobileNo || '',
        });

        this.startRefreshTokenTimer();
    }

    private startRefreshTokenTimer() {
        const expiresAt = this.tokenStore.getExpiresAtUtcMs();
        if (!expiresAt) return;

        // Calculate time remaining until token expires
        const expiresTime = expiresAt;
        const currentTime = Date.now();

        // Refresh 30 seconds before expiration
        const timeout = (expiresTime - currentTime) - (30 * 1000);
        console.log("Timeout", timeout);

        // Clear any existing timeout
        this.stopRefreshTokenTimer();

        if (timeout > 0) {

            this.refreshTokenTimeout = setTimeout(() => {
                console.log('[AuthService] Proactive token refresh triggered!', timeout);
                // We subscribe here because setTimeout requires a trigger, we don't return the observable
                this.refresh().subscribe({
                    error: (err) => {
                        console.error('[AuthService] Proactive token refresh failed', err);
                        this.clearSession(); // Fallback if refresh fails
                    }
                });
            }, timeout);
        } else {
            console.warn('[AuthService] Token is already expired or expiring very soon! Attempting immediate refresh.');
            this.refresh().subscribe({
                error: () => this.clearSession()
            });
        }
    }

    private stopRefreshTokenTimer() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }

    login(req: LoginRequest): Observable<UserInfo> {
        return this.http
            .post<ApiResponse<LoginData>>(`${this.base}${apiConfig.login}`, req)
            .pipe(
                tap(res => {
                    this.setSession(res.data.accessToken, res.data.accessTokenExpiresAtUtc);
                }),
                map(res => {
                    const decodedUser = this.userSubject.value;
                    return decodedUser as UserInfo;
                })
            );
    }

    /**
     * Refresh token call: backend uses HttpOnly cookie to validate and returns new access token.
     * Angular can't read cookie; just sends it via withCredentials.
     */
    refresh(): Observable<string> {
        return this.http
            .post<ApiResponse<RefreshData>>(`${this.base}${apiConfig.refresh}`, {})
            .pipe(
                tap(res => this.setSession(res.data.accessToken, res.data.accessTokenExpiresAtUtc)),
                map(res => res.data.accessToken)
            );
    }

    logout(): Observable<void> {
        return this.http
            .post(`${this.base}${apiConfig.logout}`, {}, { withCredentials: true })
            .pipe(
                tap(() => {
                    this.clearSession(); // Let clearSession handle the store and routing
                }),
                map(() => void 0)
            );
    }

    /**
     * Call on app start:
     * - Restores session from localStorage if present (handled in constructor).
     * - No longer blindly forces an API refresh unless the token is already expired.
     */
    bootstrapSession(): Observable<boolean> {
        return of(!!this.getAccessToken());
    }

    getAccessToken(): string | null {
        return this.tokenStore.getToken();
    }

    isTokenExpiredOrNearExpiry(): boolean {
        return this.tokenStore.isExpiredOrNearExpiry();
    }

    clearSession() {
        this.stopRefreshTokenTimer();
        this.tokenStore.clear();
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }
}
