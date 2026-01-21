import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { BusinessActivityModel } from './business-activity.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const BusinessActivityActions = createActionGroup({
  source: 'Business Activity',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      activities: BusinessActivityModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ activity: BusinessActivityModel }>(),
    'Update': props<{ activity: Update<BusinessActivityModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
