import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IssueMediaTypeActions } from './issue-media-type.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { IssueMediaTypeService } from './issue-media-type.service';

@Injectable()
export class IssueMediaTypeEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: IssueMediaTypeService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(IssueMediaTypeActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => IssueMediaTypeActions.loadSuccess({
              issueMediaTypes: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                IssueMediaTypeActions.loadFailure({
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


