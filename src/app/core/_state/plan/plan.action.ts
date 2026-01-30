import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PlanModel } from './plan.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const PlanActions = createActionGroup({
  source: 'Plan',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      plans: PlanModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ plan: PlanModel }>(),
    'Update': props<{ plan: Update<PlanModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
