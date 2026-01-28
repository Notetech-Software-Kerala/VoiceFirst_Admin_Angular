import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProgramActions } from './program.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { ProgramService } from './program.service';

@Injectable()
export class ProgramEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: ProgramService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ProgramActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => ProgramActions.loadSuccess({
              activities: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                ProgramActions.loadFailure({
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


