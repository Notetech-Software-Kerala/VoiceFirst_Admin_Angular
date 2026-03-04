// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
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
        // Expiration is safely managed by tokenStore; pass a dummy or read value if needed for setSession
        if (token) {
            this.setSession(token, new Date(this.tokenStore.isExpiredOrNearExpiry() ? 0 : Date.now() + 86400000).toISOString());
        }
    }


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
            .post<ApiResponse<RefreshData>>(`${this.base}${apiConfig.refresh}`, {}, { withCredentials: true })
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
                    this.tokenStore.clear();
                    this.userSubject.next(null);
                }),
                map(() => void 0)
            );
    }

    /**
     * Call on app start:
     * - If refresh cookie exists, you'll get a new access token and keep user logged in.
     * - If cookie missing/expired, it will fail and user remains logged out.
     */
    bootstrapSession(): Observable<boolean> {
        return this.refresh().pipe(
            map(() => true)
            // if refresh fails, caller can catchError and return false
        );
    }

    getAccessToken(): string | null {
        return this.tokenStore.getToken();
    }

    isTokenExpiredOrNearExpiry(): boolean {
        return this.tokenStore.isExpiredOrNearExpiry();
    }

    clearSession() {
        this.tokenStore.clear();
        this.userSubject.next(null);
        // this.router.navigate(['/login']);
    }
}
