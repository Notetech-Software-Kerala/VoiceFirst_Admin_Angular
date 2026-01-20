import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ProgramActionModel } from './program-action.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const ProgramActionActions = createActionGroup({
  source: 'Program Action',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      activities: ProgramActionModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ activity: ProgramActionModel }>(),
    'Update': props<{ activity: Update<ProgramActionModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
