import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RefreshManagerService } from './core/_auth/refresh-manager.service';

export function provideAuthBootstrap() {
    return provideAppInitializer(async () => {
        const refreshMgr = inject(RefreshManagerService);

        try {
            // If refresh cookie exists and valid, this will set access token in memory
            await firstValueFrom(refreshMgr.refreshOnce());
        } catch {
            // no refresh cookie / expired → user is logged out (that's fine)
        }
    });
}