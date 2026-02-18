import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './place.reducer';
import { PlaceState } from './place.state';


export const PLACE_FEATURE_KEY = 'place';

export const selectPlaceState =
  createFeatureSelector<PlaceState>(PLACE_FEATURE_KEY);

const {
  selectAll,
  selectEntities,
  selectTotal,
} = adapter.getSelectors(selectPlaceState);

export const selectAllPlaces = selectAll;

export const selectPlaceLoading = createSelector(
  selectPlaceState,
  state => state.loading
);

export const selectPlaceError = createSelector(
  selectPlaceState,
  state => state.error
);

export const selectPlaceTotal = selectTotal;

// Pagination selectors
export const selectPlaceTotalCount = createSelector(
  selectPlaceState,
  state => state.totalCount
);

export const selectPlacePageNumber = createSelector(
  selectPlaceState,
  state => state.pageNumber
);

export const selectPlacePageSize = createSelector(
  selectPlaceState,
  state => state.pageSize
);

export const selectPlaceTotalPages = createSelector(
  selectPlaceState,
  state => state.totalPages
);
