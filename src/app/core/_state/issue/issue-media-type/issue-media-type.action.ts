import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IssueMediaTypeModel } from './issue-media-type.model';
import { QueryParameterModel } from '../../../_models/query-parameter.model';



export const IssueMediaTypeActions = createActionGroup({
  source: 'Issue Media Type',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      issueMediaTypes: IssueMediaTypeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ issueMediaType: IssueMediaTypeModel }>(),
    'Update': props<{ issueMediaType: Update<IssueMediaTypeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
