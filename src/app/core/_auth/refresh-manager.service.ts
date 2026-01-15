import { Injectable } from '@angular/core';
import { Observable, defer, finalize, shareReplay, tap } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class RefreshManagerService {
    private inFlight$: Observable<string> | null = null;

    constructor(private api: AuthApiService, private state: AuthStateService) { }

    refreshOnce(): Observable<string> {
        if (this.inFlight$) return this.inFlight$;

        this.inFlight$ = defer(() => this.api.refresh()).pipe(
            tap((newAccess) => this.state.setAccessToken(newAccess)),
            shareReplay(1),
            finalize(() => (this.inFlight$ = null))
        );

        return this.inFlight$;
    }
}