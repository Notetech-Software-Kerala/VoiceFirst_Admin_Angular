import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { QueryParameterModel } from '../../_models/query-parameter.model';
import { MasterMenuModel } from './menu.model';


export const MenuActions = createActionGroup({
  source: 'Menu',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      menus: MasterMenuModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ menu: MasterMenuModel }>(),
    'Update': props<{ menu: Update<MasterMenuModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
