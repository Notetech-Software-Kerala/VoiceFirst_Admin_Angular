// src/app/auth/auth.guard.ts
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../_auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // ✅ If token exists and not expired -> allow
    const token = auth.getAccessToken();
    if (token && !auth.isTokenExpiredOrNearExpiry()) {
        return of(true);
    }

    // ✅ Otherwise try refresh (uses HttpOnly cookie)
    return auth.refresh().pipe(
        map(() => true),
        catchError(() => of(router.createUrlTree(['/login'])))
    );
};
