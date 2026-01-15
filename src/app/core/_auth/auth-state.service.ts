
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    accessToken$ = this.accessTokenSubject.asObservable();

    setAccessToken(token: string | null) {
        this.accessTokenSubject.next(token);
    }

    get accessToken(): string | null {
        return this.accessTokenSubject.value;
    }

    clear() {
        this.accessTokenSubject.next(null);
    }
}
