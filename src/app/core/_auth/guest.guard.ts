
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../_auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const guestGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // If access token exists and not expired -> already logged in
    const token = auth.getAccessToken();
    if (token && !auth.isTokenExpiredOrNearExpiry()) {
        return of(router.createUrlTree(['/dashboard']));
    }

    // If token missing/expired -> try refresh using cookie
    return auth.refresh().pipe(
        // refresh success => logged in => redirect away from login page
        map(() => router.createUrlTree(['/dashboard'])),
        // refresh failed => not logged in => allow access to /login
        catchError(() => of(true))
    );
};