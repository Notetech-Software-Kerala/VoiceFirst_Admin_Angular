import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IssueStatusActions } from './issue-status.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { IssueStatusService } from './issue-status.service';

@Injectable()
export class IssueStatusEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: IssueStatusService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(IssueStatusActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => IssueStatusActions.loadSuccess({
              issueStatus: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                IssueStatusActions.loadFailure({
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


