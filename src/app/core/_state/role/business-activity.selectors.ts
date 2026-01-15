import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './business-activity.reducer';
import { BusinessActivityState } from './business-activity.state';

export const FEATURE_KEY = 'businessActivities';

export const selectBusinessActivityState =
  createFeatureSelector<BusinessActivityState>(FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectBusinessActivityState);

export const selectAllBusinessActivities = selectAll;

export const selectBusinessActivityLoading = createSelector(
  selectBusinessActivityState,
  state => state.loading
);

export const selectBusinessActivityError = createSelector(
  selectBusinessActivityState,
  state => state.error
);

export const selectBusinessActivityTotal = selectTotal;
