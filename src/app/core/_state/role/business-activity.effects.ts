import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BusinessActivityActions } from './business-activity.actions';
import { catchError, map, switchMap, of } from 'rxjs';
import { BusinessActivityService } from './business-activity.service';

@Injectable()
export class BusinessActivityEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: BusinessActivityService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(BusinessActivityActions.load),
        switchMap(() =>
          this.service.getAll().pipe(
            map((activities) => BusinessActivityActions.loadSuccess({ activities })),
            catchError((err) =>
              of(
                BusinessActivityActions.loadFailure({
                  error: err?.message ?? 'Load failed',
                })
              )
            )
          )
        )
      )
    );
  }
}


