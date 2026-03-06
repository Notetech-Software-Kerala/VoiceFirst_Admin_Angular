import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './issue-media-format.reducer';
import { IssueMediaFormatState } from './issue-media-format.state';

export const ISSUE_MEDIA_FORMAT_FEATURE_KEY = 'issueMediaFormats';

export const selectIssueMediaFormatState =
  createFeatureSelector<IssueMediaFormatState>(ISSUE_MEDIA_FORMAT_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectIssueMediaFormatState);

export const selectAllIssueMediaFormats = selectAll;

export const selectIssueMediaFormatLoading = createSelector(
  selectIssueMediaFormatState,
  state => state.loading
);

export const selectIssueMediaFormatError = createSelector(
  selectIssueMediaFormatState,
  state => state.error
);

export const selectIssueMediaFormatTotal = selectTotal;

// Pagination selectors
export const selectIssueMediaFormatTotalCount = createSelector(
  selectIssueMediaFormatState,
  state => state.totalCount
);

export const selectIssueMediaFormatPageNumber = createSelector(
  selectIssueMediaFormatState,
  state => state.pageNumber
);

export const selectIssueMediaFormatPageSize = createSelector(
  selectIssueMediaFormatState,
  state => state.pageSize
);

export const selectIssueMediaFormatTotalPages = createSelector(
  selectIssueMediaFormatState,
  state => state.totalPages
);
