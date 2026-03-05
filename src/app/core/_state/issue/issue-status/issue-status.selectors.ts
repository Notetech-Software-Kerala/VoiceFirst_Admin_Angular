import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './issue-status.reducer';
import { IssueStatusState } from './issue-status.state';

export const ISSUE_STATUS_FEATURE_KEY = 'issueStatus';

export const selectIssueStatusState =
  createFeatureSelector<IssueStatusState>(ISSUE_STATUS_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectIssueStatusState);

export const selectAllIssueStatus = selectAll;

export const selectIssueStatusLoading = createSelector(
  selectIssueStatusState,
  state => state.loading
);

export const selectIssueStatusError = createSelector(
  selectIssueStatusState,
  state => state.error
);

export const selectIssueStatusTotal = selectTotal;

// Pagination selectors
export const selectIssueStatusTotalCount = createSelector(
  selectIssueStatusState,
  state => state.totalCount
);

export const selectIssueStatusPageNumber = createSelector(
  selectIssueStatusState,
  state => state.pageNumber
);

export const selectIssueStatusPageSize = createSelector(
  selectIssueStatusState,
  state => state.pageSize
);

export const selectIssueStatusTotalPages = createSelector(
  selectIssueStatusState,
  state => state.totalPages
);
