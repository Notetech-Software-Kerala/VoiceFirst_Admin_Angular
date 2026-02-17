import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MenuActions } from './menu.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { MenuService } from './menu.service';


@Injectable()
export class MenuEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: MenuService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(MenuActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => MenuActions.loadSuccess({
              menus: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                MenuActions.loadFailure({
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


