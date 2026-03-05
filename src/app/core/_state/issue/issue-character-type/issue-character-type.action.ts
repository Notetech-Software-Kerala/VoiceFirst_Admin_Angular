import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueCharacterTypeModel } from './issue-character-type.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const IssueCharacterTypeActions = createActionGroup({
  source: 'Issue Character Type',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      issueCharacterTypes: IssueCharacterTypeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ issueCharacterType: IssueCharacterTypeModel }>(),
    'Update': props<{ issueCharacterType: Update<IssueCharacterTypeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
