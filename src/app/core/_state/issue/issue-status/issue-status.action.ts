import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueStatusModel } from './issue-status.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const IssueStatusActions = createActionGroup({
  source: 'Issue Status',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      issueStatus: IssueStatusModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ issueStatus: IssueStatusModel }>(),
    'Update': props<{ issueStatus: Update<IssueStatusModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
