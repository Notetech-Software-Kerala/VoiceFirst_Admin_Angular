import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlanActions } from './plan.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { PlanService } from './plan.service';

@Injectable()
export class PlanEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: PlanService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PlanActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => PlanActions.loadSuccess({
              plans: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                PlanActions.loadFailure({
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


