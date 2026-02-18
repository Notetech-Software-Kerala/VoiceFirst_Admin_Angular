import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlaceActions } from './place.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { PlaceService } from './place.service';

@Injectable()
export class PlaceEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: PlaceService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PlaceActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => PlaceActions.loadSuccess({
              places: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                PlaceActions.loadFailure({
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


