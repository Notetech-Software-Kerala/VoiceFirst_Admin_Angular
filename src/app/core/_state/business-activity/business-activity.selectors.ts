import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './business-activity.reducer';
import { BusinessActivityState } from './business-activity.state';

export const FEATURE_KEY = 'businessActivities';

export const selectBusinessActivityState =
  createFeatureSelector<BusinessActivityState>(FEATURE_KEY);

export const {
  selectIds: selectBusinessActivityIds,
  selectEntities: selectBusinessActivityEntities,
  selectAll: selectAllBusinessActivities,
  selectTotal: selectBusinessActivityTotal,
} = adapter.getSelectors(selectBusinessActivityState);

export const selectBusinessActivityLoading = createSelector(
  selectBusinessActivityState,
  state => state.loading
);

export const selectBusinessActivityError = createSelector(
  selectBusinessActivityState,
  state => state.error
);

export const selectBusinessActivityTotalCount = createSelector(
  selectBusinessActivityState,
  state => state.totalCount
);

export const selectBusinessActivityPageNumber = createSelector(
  selectBusinessActivityState,
  state => state.pageNumber
);

export const selectBusinessActivityPageSize = createSelector(
  selectBusinessActivityState,
  state => state.pageSize
);

export const selectBusinessActivityTotalPages = createSelector(
  selectBusinessActivityState,
  state => state.totalPages
);
