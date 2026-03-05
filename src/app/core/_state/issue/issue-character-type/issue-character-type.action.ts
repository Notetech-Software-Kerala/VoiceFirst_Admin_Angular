import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueCharacterTypeModel } from './issue-character-type.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const ProgramActionActions = createActionGroup({
  source: 'Program Action',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      programActions: IssueCharacterTypeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ programAction: IssueCharacterTypeModel }>(),
    'Update': props<{ programAction: Update<IssueCharacterTypeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
