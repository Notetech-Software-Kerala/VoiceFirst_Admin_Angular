import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CustomFieldActions } from './custom-field.actions';
import { catchError, map, switchMap, of } from 'rxjs';
import { CustomFieldService } from './custom-field.service';

@Injectable()
export class CustomFieldEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: CustomFieldService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CustomFieldActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => CustomFieldActions.loadSuccess({
              customFields: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                CustomFieldActions.loadFailure({
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
