import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueTypeModel } from './issue-type.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const IssueTypeActions = createActionGroup({
  source: 'Issue Type',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      issueTypes: IssueTypeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ issueTypes: IssueTypeModel }>(),
    'Update': props<{ issueTypes: Update<IssueTypeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
