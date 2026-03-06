import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './issue-type.reducer';
import { IssueTypeState } from './issue-type.state';


export const ISSUE_TYPE_FEATURE_KEY = 'issueType';

export const selectIssueTypeState =
  createFeatureSelector<IssueTypeState>(ISSUE_TYPE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectIssueTypeState);

export const selectAllIssueType = selectAll;

export const selectIssueTypeLoading = createSelector(
  selectIssueTypeState,
  state => state.loading
);

export const selectIssueTypeError = createSelector(
  selectIssueTypeState,
  state => state.error
);

export const selectIssueTypeTotal = selectTotal;

// Pagination selectors
export const selectIssueTypeTotalCount = createSelector(
  selectIssueTypeState,
  state => state.totalCount
);

export const selectIssueTypePageNumber = createSelector(
  selectIssueTypeState,
  state => state.pageNumber
);

export const selectIssueTypePageSize = createSelector(
  selectIssueTypeState,
  state => state.pageSize
);

export const selectIssueTypeTotalPages = createSelector(
  selectIssueTypeState,
  state => state.totalPages
);
