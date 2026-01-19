// src/app/auth/token.store.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStore {
    private accessToken: string | null = null;
    private expiresAtUtcMs: number | null = null;

    set(accessToken: string, expiresAtUtc: string) {
        this.accessToken = accessToken;
        this.expiresAtUtcMs = Date.parse(expiresAtUtc);
    }

    clear() {
        this.accessToken = null;
        this.expiresAtUtcMs = null;
    }

    getToken(): string | null {
        return this.accessToken;
    }

    /** true if token missing or expiring soon */
    isExpiredOrNearExpiry(skewSeconds = 30): boolean {
        if (!this.accessToken || !this.expiresAtUtcMs) return true;
        const now = Date.now();
        return now >= (this.expiresAtUtcMs - skewSeconds * 1000);
    }
}
