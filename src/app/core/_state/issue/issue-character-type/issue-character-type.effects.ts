import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IssueCharacterTypeActions } from './issue-character-type.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { IssueCharacterTypeService } from './issue-character-type.service';

@Injectable()
export class IssueCharacterTypeEffects {
  load$;

  constructor(
    private actions$: Actions,
    private service: IssueCharacterTypeService
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(IssueCharacterTypeActions.load),
        switchMap(({ queryParams }) =>
          this.service.getAll(queryParams).pipe(
            map((paginatedData) => IssueCharacterTypeActions.loadSuccess({
              issueCharacterTypes: paginatedData.items,
              totalCount: paginatedData.totalCount,
              pageNumber: paginatedData.pageNumber,
              pageSize: paginatedData.pageSize,
              totalPages: paginatedData.totalPages
            })),
            catchError((err) =>
              of(
                IssueCharacterTypeActions.loadFailure({
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


