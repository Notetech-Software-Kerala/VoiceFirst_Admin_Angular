import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './issue-media-type.reducer';
import { IssueMediaTypeState } from './issue-media-type.state';

export const ISSUE_MEDIA_TYPE_FEATURE_KEY = 'issueMediaTypes';

export const selectIssueMediaTypeState =
  createFeatureSelector<IssueMediaTypeState>(ISSUE_MEDIA_TYPE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectIssueMediaTypeState);

export const selectAllIssueMediaTypes = selectAll;

export const selectIssueMediaTypeLoading = createSelector(
  selectIssueMediaTypeState,
  state => state.loading
);

export const selectIssueMediaTypeError = createSelector(
  selectIssueMediaTypeState,
  state => state.error
);

export const selectIssueMediaTypeTotal = selectTotal;

// Pagination selectors
export const selectIssueMediaTypeTotalCount = createSelector(
  selectIssueMediaTypeState,
  state => state.totalCount
);

export const selectIssueMediaTypePageNumber = createSelector(
  selectIssueMediaTypeState,
  state => state.pageNumber
);

export const selectIssueMediaTypePageSize = createSelector(
  selectIssueMediaTypeState,
  state => state.pageSize
);

export const selectIssueMediaTypeTotalPages = createSelector(
  selectIssueMediaTypeState,
  state => state.totalPages
);
