import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { MenuActions } from './menu.action';
import { MenuState } from './menu.state';
import { MasterMenuModel } from './menu.model';

export const adapter: EntityAdapter<MasterMenuModel> =
  createEntityAdapter<MasterMenuModel>({
    selectId: a => a.menuId,
  });

export const initialState: MenuState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const menuReducer = createReducer(
  initialState,

  on(MenuActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(MenuActions.loadSuccess, (state, { menus, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(menus, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(MenuActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(MenuActions.add, (state, { menu }) =>
    adapter.addOne(menu, state)
  ),

  on(MenuActions.update, (state, { menu }) =>
    adapter.updateOne(menu, state)
  ),

  on(MenuActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
