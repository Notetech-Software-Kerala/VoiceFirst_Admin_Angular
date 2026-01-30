import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import { RoleState } from './role.state';
import { RoleModel } from './role.model';
import { RoleActions } from './role.action';


export const adapter: EntityAdapter<RoleModel> =
  createEntityAdapter<RoleModel>({
    selectId: a => a.roleId,
  });

export const initialState: RoleState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const roleReducer = createReducer(
  initialState,

  on(RoleActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(RoleActions.loadSuccess, (state, { roles, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(roles, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(RoleActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(RoleActions.add, (state, { role }) =>
    adapter.addOne(role, state)
  ),

  on(RoleActions.update, (state, { role }) =>
    adapter.updateOne(role, state)
  ),

  on(RoleActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
