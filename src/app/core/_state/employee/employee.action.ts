import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { EmployeeModel } from './employee.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const EmployeeActions = createActionGroup({
    source: 'Employee',

    events: {
        'Load': props<{ queryParams: QueryParameterModel }>(),
        'Load Success': props<{
            employees: EmployeeModel[];
            totalCount: number;
            pageNumber: number;
            pageSize: number;
            totalPages: number;
        }>(),
        'Load Failure': props<{ error: string }>(),
        'Add': props<{ employee: EmployeeModel }>(),
        'Update': props<{ employee: Update<EmployeeModel> }>(),
        'Delete': props<{ id: number }>(),
    },
});
