// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { TokenStore } from './token.store';
import { environment } from '../../environment/environment';
import { ApiResponse, LoginData, LoginRequest, RefreshData, UserInfo } from './auth.model';
import { apiConfig } from '../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = environment.loginBaseUrl;

    private userSubject = new BehaviorSubject<UserInfo | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private tokenStore: TokenStore) { }

    login(req: LoginRequest): Observable<UserInfo> {
        return this.http
            .post<ApiResponse<LoginData>>(`${this.base}${apiConfig.login}`, req, { withCredentials: true })
            .pipe(
                tap(res => {
                    this.tokenStore.set(res.data.accessToken, res.data.accessTokenExpiresAtUtc);
                    this.userSubject.next({
                        userId: res.data.userId,
                        firstName: res.data.firstName,
                        lastName: res.data.lastName,
                        email: res.data.email,
                        mobileNo: res.data.mobileNo,
                    });
                }),
                map(res => ({
                    userId: res.data.userId,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    email: res.data.email,
                    mobileNo: res.data.mobileNo,
                }))
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
                tap(res => this.tokenStore.set(res.data.accessToken, res.data.accessTokenExpiresAtUtc)),
                map(res => res.data.accessToken)
            );
    }

    logout(): Observable<void> {
        return this.http
            .post(`${this.base}/auth/logout`, {}, { withCredentials: true, responseType: 'text' as const })
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
    }
}
