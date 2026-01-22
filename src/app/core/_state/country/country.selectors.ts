import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './country.reducer';
import { CountryState } from './country.state';

export const FEATURE_KEY = 'country';

export const selectCountryState =
  createFeatureSelector<CountryState>(FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectCountryState);

export const selectAllCountryActions = selectAll;

export const selectCountryLoading = createSelector(
  selectCountryState,
  state => state.loading
);

export const selectCountryError = createSelector(
  selectCountryState,
  state => state.error
);

export const selectCountryTotal = selectTotal;

// Pagination selectors
export const selectCountryTotalCount = createSelector(
  selectCountryState,
  state => state.totalCount
);

export const selectCountryPageNumber = createSelector(
  selectCountryState,
  state => state.pageNumber
);

export const selectCountryPageSize = createSelector(
  selectCountryState,
  state => state.pageSize
);

export const selectCountryTotalPages = createSelector(
  selectCountryState,
  state => state.totalPages
);
