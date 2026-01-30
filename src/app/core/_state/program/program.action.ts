import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ProgramModel } from './program.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const ProgramActions = createActionGroup({
  source: 'Program',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      programs: ProgramModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ program: ProgramModel }>(),
    'Update': props<{ program: Update<ProgramModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
