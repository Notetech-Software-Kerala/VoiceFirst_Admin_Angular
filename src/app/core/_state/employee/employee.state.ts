import { EntityState } from '@ngrx/entity';
import { EmployeeModel } from './employee.model';

export interface EmployeeState extends EntityState<EmployeeModel> {
    loading: boolean;
    error: string | null;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
