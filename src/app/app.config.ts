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
import { errorInterceptor } from './core/_http/error.interceptor';
import { programActionReducer } from './core/_state/program-action/program-action.reducer';
import { ProgramActionEffects } from './core/_state/program-action/program-action.effects';
import { PROGRAM_ACTION_FEATURE_KEY } from './core/_state/program-action/program-action.selectors';
import { postOfficeReducer } from './core/_state/post-office/post-office.reducer';
import { POST_OFFICE_FEATURE_KEY } from './core/_state/post-office/post-office.selectors';
import { PostOfficeEffects } from './core/_state/post-office/post-office.effects';
import { countryReducer } from './core/_state/country/country.reducer';
import { COUNTRY_FEATURE_KEY } from './core/_state/country/country.selectors';
import { CountryEffects } from './core/_state/country/country.effects';
import { programReducer } from './core/_state/program/program.reducer';
import { PROGRAM_FEATURE_KEY } from './core/_state/program/program.selectors';
import { ProgramEffects } from './core/_state/program/program.effects';
import { roleReducer } from './core/_state/role/role.reducer';
import { ROLE_FEATURE_KEY } from './core/_state/role/role.selectors';
import { RoleEffects } from './core/_state/role/role.effects';
import { planReducer } from './core/_state/plan/plan.reducer';
import { PLAN_FEATURE_KEY } from './core/_state/plan/plan.selectors';
import { PlanEffects } from './core/_state/plan/plan.effects';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({
      [BUSINESS_ACTIVITY_FEATURE_KEY]: businessActivityReducer,
      [PROGRAM_ACTION_FEATURE_KEY]: programActionReducer,
      [POST_OFFICE_FEATURE_KEY]: postOfficeReducer,
      [COUNTRY_FEATURE_KEY]: countryReducer,
      [PROGRAM_FEATURE_KEY]: programReducer,
      [ROLE_FEATURE_KEY]: roleReducer,
      [PLAN_FEATURE_KEY]: planReducer,
    }),
    provideEffects([
      BusinessActivityEffects,
      ProgramActionEffects,
      PostOfficeEffects,
      CountryEffects,
      ProgramEffects,
      RoleEffects,
      PlanEffects
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
