import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CountryActions } from './country.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { CountryService } from './country.service';

@Injectable()
export class CountryEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: CountryService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CountryActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => CountryActions.loadSuccess({
              activities: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                CountryActions.loadFailure({
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


