import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IssueTypeActions } from './issue-type.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { IssueTypeService } from './issue-type.service';

@Injectable()
export class IssueTypeEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: IssueTypeService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(IssueTypeActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => IssueTypeActions.loadSuccess({
              issueTypes: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                IssueTypeActions.loadFailure({
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


