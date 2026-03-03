import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, switchMap, of } from 'rxjs';

import { EmployeeService } from './employee.service';
import { EmployeeActions } from './employee.action';

@Injectable()
export class EmployeeEffects {
    load$;

    constructor(
        private actions$: Actions,
        private service: EmployeeService
    ) {
        this.load$ = createEffect(() =>
            this.actions$.pipe(
                ofType(EmployeeActions.load),
                switchMap(({ queryParams }) =>
                    this.service.getAll(queryParams).pipe(
                        map((paginatedData) => EmployeeActions.loadSuccess({
                            employees: paginatedData.items,
                            totalCount: paginatedData.totalCount,
                            pageNumber: paginatedData.pageNumber,
                            pageSize: paginatedData.pageSize,
                            totalPages: paginatedData.totalPages
                        })),
                        catchError((err) =>
                            of(
                                EmployeeActions.loadFailure({
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
