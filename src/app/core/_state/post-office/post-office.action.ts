import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { QueryParameterModel } from '../../_models/query-parameter.model';
import { PostOfficeModel } from './post-office.model';


export const PostOfficeActions = createActionGroup({
  source: 'Post Office',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      activities: PostOfficeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ activity: PostOfficeModel }>(),
    'Update': props<{ activity: Update<PostOfficeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
