import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PostOfficeActions } from './post-office.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { PostOfficeService } from './post-office.service';

@Injectable()
export class PostOfficeEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: PostOfficeService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PostOfficeActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => PostOfficeActions.loadSuccess({
              postOffices: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                PostOfficeActions.loadFailure({
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


