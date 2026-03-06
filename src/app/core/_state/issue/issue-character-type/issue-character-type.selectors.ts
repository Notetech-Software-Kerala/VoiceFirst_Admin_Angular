import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './issue-character-type.reducer';
import { IssueCharacterTypeState } from './issue-character-type.state';

export const ISSUE_CHARACTER_TYPE_FEATURE_KEY = 'issueCharacterTypes';

export const selectIssueCharacterTypeState =
  createFeatureSelector<IssueCharacterTypeState>(ISSUE_CHARACTER_TYPE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectIssueCharacterTypeState);

export const selectAllIssueCharacterTypes = selectAll;

export const selectIssueCharacterTypeLoading = createSelector(
  selectIssueCharacterTypeState,
  state => state.loading
);

export const selectIssueCharacterTypeError = createSelector(
  selectIssueCharacterTypeState,
  state => state.error
);

export const selectIssueCharacterTypeTotal = selectTotal;

// Pagination selectors
export const selectIssueCharacterTypeTotalCount = createSelector(
  selectIssueCharacterTypeState,
  state => state.totalCount
);

export const selectIssueCharacterTypePageNumber = createSelector(
  selectIssueCharacterTypeState,
  state => state.pageNumber
);

export const selectIssueCharacterTypePageSize = createSelector(
  selectIssueCharacterTypeState,
  state => state.pageSize
);

export const selectIssueCharacterTypeTotalPages = createSelector(
  selectIssueCharacterTypeState,
  state => state.totalPages
);
