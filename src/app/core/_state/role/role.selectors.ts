import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './role.reducer';
import { RoleState } from './role.state';

export const ROLE_FEATURE_KEY = 'role';

export const selectRoleState =
  createFeatureSelector<RoleState>(ROLE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectRoleState);

export const selectAllRoles = selectAll;

export const selectRoleLoading = createSelector(
  selectRoleState,
  state => state.loading
);

export const selectRoleError = createSelector(
  selectRoleState,
  state => state.error
);

export const selectRoleTotal = selectTotal;

// Pagination selectors
export const selectRoleTotalCount = createSelector(
  selectRoleState,
  state => state.totalCount
);

export const selectRolePageNumber = createSelector(
  selectRoleState,
  state => state.pageNumber
);

export const selectRolePageSize = createSelector(
  selectRoleState,
  state => state.pageSize
);

export const selectRoleTotalPages = createSelector(
  selectRoleState,
  state => state.totalPages
);
