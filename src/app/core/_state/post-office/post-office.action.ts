import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { QueryParameterModel } from '../../_models/query-parameter.model';
import { PostOfficeModel } from './post-office.model';


export const PostOfficeActions = createActionGroup({
  source: 'Post Office',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      postOffices: PostOfficeModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ postOffice: PostOfficeModel }>(),
    'Update': props<{ postOffice: Update<PostOfficeModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
