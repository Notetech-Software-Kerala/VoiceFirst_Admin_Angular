import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProgramActionActions } from './program-action.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { ProgramActionService } from './program-action.service';

@Injectable()
export class ProgramActionEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: ProgramActionService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ProgramActionActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => ProgramActionActions.loadSuccess({
              programActions: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                ProgramActionActions.loadFailure({
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


