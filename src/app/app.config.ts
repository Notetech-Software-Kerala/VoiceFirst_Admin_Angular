import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { businessActivityReducer } from './core/_state/business-activity/business-activity.reducer';
import { BusinessActivityEffects } from './core/_state/business-activity/business-activity.effects';
import { FEATURE_KEY } from './core/_state/business-activity/business-activity.selectors';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/_http/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [FEATURE_KEY]: businessActivityReducer
    }),
    provideEffects([BusinessActivityEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
