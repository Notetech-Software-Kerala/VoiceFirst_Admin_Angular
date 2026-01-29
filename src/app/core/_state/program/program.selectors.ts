import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './program.reducer';
import { ProgramState } from './program.state';
import { selectProgramActionState } from '../program-action/program-action.selectors';

export const PROGRAM_FEATURE_KEY = 'program';

export const selectProgramState =
  createFeatureSelector<ProgramState>(PROGRAM_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectProgramState);

export const selectAllPrograms = selectAll;

export const selectProgramLoading = createSelector(
  selectProgramState,
  state => state.loading
);

export const selectProgramError = createSelector(
  selectProgramState,
  state => state.error
);

export const selectProgramTotal = selectTotal;

// Pagination selectors
export const selectProgramTotalCount = createSelector(
  selectProgramState,
  state => state.totalCount
);

export const selectProgramPageNumber = createSelector(
  selectProgramState,
  state => state.pageNumber
);

export const selectProgramPageSize = createSelector(
  selectProgramState,
  state => state.pageSize
);

export const selectProgramTotalPages = createSelector(
  selectProgramState,
  state => state.totalPages
);
