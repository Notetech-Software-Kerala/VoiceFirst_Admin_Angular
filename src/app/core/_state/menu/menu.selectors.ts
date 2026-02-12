import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './menu.reducer';
import { MenuState } from './menu.state';

export const MENU_FEATURE_KEY = 'menu';

export const selectMenuState =
  createFeatureSelector<MenuState>(MENU_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectMenuState);

export const selectAllMenus = selectAll;

export const selectMenuLoading = createSelector(
  selectMenuState,
  state => state.loading
);

export const selectMenuError = createSelector(
  selectMenuState,
  state => state.error
);

export const selectMenuTotal = selectTotal;

// Pagination selectors
export const selectMenuTotalCount = createSelector(
  selectMenuState,
  state => state.totalCount
);

export const selectMenuPageNumber = createSelector(
  selectMenuState,
  state => state.pageNumber
);

export const selectMenuPageSize = createSelector(
  selectMenuState,
  state => state.pageSize
);

export const selectMenuTotalPages = createSelector(
  selectMenuState,
  state => state.totalPages
);
