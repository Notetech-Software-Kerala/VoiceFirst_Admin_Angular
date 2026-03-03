import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employee.state';
import { adapter } from './employee.reducer';

export const EMPLOYEE_FEATURE_KEY = 'employee';

export const selectEmployeeState = createFeatureSelector<EmployeeState>(EMPLOYEE_FEATURE_KEY);

const { selectAll, selectEntities, selectTotal } = adapter.getSelectors(selectEmployeeState);

export const selectAllEmployees = selectAll;

export const selectEmployeeLoading = createSelector(
    selectEmployeeState,
    (state: EmployeeState) => state.loading
);

export const selectEmployeeTotalCount = createSelector(
    selectEmployeeState,
    (state: EmployeeState) => state.totalCount
);

export const selectEmployeeTotalPages = createSelector(
    selectEmployeeState,
    (state: EmployeeState) => state.totalPages
);
