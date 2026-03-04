import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { EmployeeActions } from './employee.action';
import { EmployeeModel } from './employee.model';
import { EmployeeState } from './employee.state';

export const adapter: EntityAdapter<EmployeeModel> =
    createEntityAdapter<EmployeeModel>({
        selectId: a => a.employeeId,
    });

export const initialState: EmployeeState =
    adapter.getInitialState({
        loading: false,
        error: null,
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
    });

export const employeeReducer = createReducer(
    initialState,

    on(EmployeeActions.load, state => ({
        ...state,
        loading: true,
    })),

    on(EmployeeActions.loadSuccess, (state, { employees, totalCount, pageNumber, pageSize, totalPages }) =>
        adapter.setAll(employees, {
            ...state,
            loading: false,
            error: null,
            totalCount,
            pageNumber,
            pageSize,
            totalPages,
        })
    ),

    on(EmployeeActions.loadFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    on(EmployeeActions.add, (state, { employee }) =>
        adapter.addOne(employee, state)
    ),

    on(EmployeeActions.update, (state, { employee }) =>
        adapter.updateOne(employee, state)
    ),

    on(EmployeeActions.delete, (state, { id }) =>
        adapter.removeOne(id, state)
    )
);
