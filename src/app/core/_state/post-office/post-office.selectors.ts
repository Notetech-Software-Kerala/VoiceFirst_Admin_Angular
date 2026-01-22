import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './post-office.reducer';
import { PostOfficeState } from './post-office.state';

export const POST_OFFICE_FEATURE_KEY = 'postOffice';

export const selectPostOfficeState =
  createFeatureSelector<PostOfficeState>(POST_OFFICE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectPostOfficeState);

export const selectAllPostOffices = selectAll;

export const selectPostOfficeLoading = createSelector(
  selectPostOfficeState,
  state => state.loading
);

export const selectPostOfficeError = createSelector(
  selectPostOfficeState,
  state => state.error
);

export const selectPostOfficeTotal = selectTotal;

// Pagination selectors
export const selectPostOfficeTotalCount = createSelector(
  selectPostOfficeState,
  state => state.totalCount
);

export const selectPostOfficePageNumber = createSelector(
  selectPostOfficeState,
  state => state.pageNumber
);

export const selectPostOfficePageSize = createSelector(
  selectPostOfficeState,
  state => state.pageSize
);

export const selectPostOfficeTotalPages = createSelector(
  selectPostOfficeState,
  state => state.totalPages
);
