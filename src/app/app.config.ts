import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { businessActivityReducer } from './core/_state/business-activity/business-activity.reducer';
import { BusinessActivityEffects } from './core/_state/business-activity/business-activity.effects';
import { BUSINESS_ACTIVITY_FEATURE_KEY } from './core/_state/business-activity/business-activity.selectors';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/_http/auth.interceptor';
import { programActionReducer } from './core/_state/program-action/program-action.reducer';
import { ProgramActionEffects } from './core/_state/program-action/program-action.effects';
import { PROGRAM_ACTION_FEATURE_KEY } from './core/_state/program-action/program-action.selectors';
import { postOfficeReducer } from './core/_state/post-office/post-office.reducer';
import { POST_OFFICE_FEATURE_KEY } from './core/_state/post-office/post-office.selectors';
import { PostOfficeEffects } from './core/_state/post-office/post-office.effects';
import { countryReducer } from './core/_state/country/country.reducer';
import { COUNTRY_FEATURE_KEY } from './core/_state/country/country.selectors';
import { CountryEffects } from './core/_state/country/country.effects';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [BUSINESS_ACTIVITY_FEATURE_KEY]: businessActivityReducer,
      [PROGRAM_ACTION_FEATURE_KEY]: programActionReducer,
      [POST_OFFICE_FEATURE_KEY]: postOfficeReducer,
      [COUNTRY_FEATURE_KEY]: countryReducer
    }),
    provideEffects([
      BusinessActivityEffects, 
      ProgramActionEffects, 
      PostOfficeEffects, 
      CountryEffects
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
