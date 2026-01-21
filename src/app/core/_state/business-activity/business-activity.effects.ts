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
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => BusinessActivityActions.loadSuccess({
              activities: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
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
