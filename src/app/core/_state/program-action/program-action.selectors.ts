import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './program-action.reducer';
import { ProgramActionState } from './program-action.state';

export const FEATURE_KEY = 'programActions';

export const selectProgramActionState =
  createFeatureSelector<ProgramActionState>(FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectProgramActionState);

export const selectAllProgramActions = selectAll;

export const selectProgramActionLoading = createSelector(
  selectProgramActionState,
  state => state.loading
);

export const selectProgramActionError = createSelector(
  selectProgramActionState,
  state => state.error
);

export const selectProgramActionTotal = selectTotal;

// Pagination selectors
export const selectProgramActionTotalCount = createSelector(
  selectProgramActionState,
  state => state.totalCount
);

export const selectProgramActionPageNumber = createSelector(
  selectProgramActionState,
  state => state.pageNumber
);

export const selectProgramActionPageSize = createSelector(
  selectProgramActionState,
  state => state.pageSize
);

export const selectProgramActionTotalPages = createSelector(
  selectProgramActionState,
  state => state.totalPages
);
