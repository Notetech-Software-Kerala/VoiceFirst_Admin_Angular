import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './plan.reducer';
import { PlanState } from './plan.state';


export const PLAN_FEATURE_KEY = 'plan';

export const selectPlanState =
  createFeatureSelector<PlanState>(PLAN_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectPlanState);

export const selectAllPlans = selectAll;

export const selectPlanLoading = createSelector(
  selectPlanState,
  state => state.loading
);

export const selectPlanError = createSelector(
  selectPlanState,
  state => state.error
);

export const selectPlanTotal = selectTotal;

// Pagination selectors
export const selectPlanTotalCount = createSelector(
  selectPlanState,
  state => state.totalCount
);

export const selectPlanPageNumber = createSelector(
  selectPlanState,
  state => state.pageNumber
);

export const selectPlanPageSize = createSelector(
  selectPlanState,
  state => state.pageSize
);

export const selectPlanTotalPages = createSelector(
  selectPlanState,
  state => state.totalPages
);
