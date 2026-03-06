import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IssueMediaFormatActions } from './issue-media-format.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { IssueMediaFormatService } from './issue-media-format.service';

@Injectable()
export class IssueMediaFormatEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: IssueMediaFormatService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(IssueMediaFormatActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => IssueMediaFormatActions.loadSuccess({
              issueMediaFormats: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                IssueMediaFormatActions.loadFailure({
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


