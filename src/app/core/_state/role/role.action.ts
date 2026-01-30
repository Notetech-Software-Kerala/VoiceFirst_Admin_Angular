import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { QueryParameterModel } from '../../_models/query-parameter.model';
import { RoleModel } from './role.model';


export const RoleActions = createActionGroup({
  source: 'Role',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      roles: RoleModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ role: RoleModel }>(),
    'Update': props<{ role: Update<RoleModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
