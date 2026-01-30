
import { EntityState } from '@ngrx/entity';
import { PlanModel } from './plan.model';


export interface PlanState extends EntityState<PlanModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
