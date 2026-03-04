// src/app/auth/token.store.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStore {
    private accessToken: string | null = null;
    private expiresAtUtcMs: number | null = null;

    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        const exp = localStorage.getItem('expiresAtUtcMs');
        if (exp) this.expiresAtUtcMs = parseInt(exp, 10);
    }

    set(accessToken: string, expiresAtUtc: string) {
        this.accessToken = accessToken;
        this.expiresAtUtcMs = Date.parse(expiresAtUtc);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('expiresAtUtcMs', this.expiresAtUtcMs.toString());
    }

    clear() {
        this.accessToken = null;
        this.expiresAtUtcMs = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expiresAtUtcMs');
    }

    getToken(): string | null {
        return this.accessToken;
    }

    getExpiresAtUtcMs(): number | null {
        return this.expiresAtUtcMs;
    }

    /** true if token missing or expiring soon */
    isExpiredOrNearExpiry(skewSeconds = 30): boolean {
        if (!this.accessToken || !this.expiresAtUtcMs) return true;
        const now = Date.now();
        return now >= (this.expiresAtUtcMs - skewSeconds * 1000);
    }
}
