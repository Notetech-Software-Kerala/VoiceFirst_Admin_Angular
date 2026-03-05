import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueMediaFormatModel } from './issue-media-format.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const IssueMediaFormatActions = createActionGroup({
  source: 'Issue Media Format',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      issueMediaFormats: IssueMediaFormatModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ issueMediaFormat: IssueMediaFormatModel }>(),
    'Update': props<{ issueMediaFormat: Update<IssueMediaFormatModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
