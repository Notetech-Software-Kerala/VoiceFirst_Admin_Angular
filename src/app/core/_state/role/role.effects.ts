import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RoleActions } from './role.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { RoleService } from './role.service';

@Injectable()
export class RoleEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: RoleService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(RoleActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => RoleActions.loadSuccess({
              roles: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                RoleActions.loadFailure({
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


