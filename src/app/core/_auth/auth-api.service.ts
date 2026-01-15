import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environment/environment';
import { apiConfig } from '../_config/apiConfig';

type TokenResponse = { accessToken: string };

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    constructor(private http: HttpClient) { }

    private get baseUrl(): string {
        return environment.baseUrl;
    }

    login(email: string, password: string) {
        return this.http
            .post<TokenResponse>(`${this.baseUrl}${apiConfig.login}`, { email, password }, { withCredentials: true })
            .pipe(map(r => r.accessToken));
    }

    refresh() {
        return this.http
            .post<TokenResponse>(`${this.baseUrl}${apiConfig.refresh}`, {}, { withCredentials: true })
            .pipe(map(r => r.accessToken));
    }

    logout() {
        return this.http.post<void>(`${this.baseUrl}${apiConfig.logout}`, {}, { withCredentials: true });
    }
}