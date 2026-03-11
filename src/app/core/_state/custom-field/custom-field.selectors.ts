import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './custom-field.reducer';
import { CustomFieldState } from './custom-field.state';

export const CUSTOM_FIELD_FEATURE_KEY = 'customFields';

export const selectCustomFieldState =
  createFeatureSelector<CustomFieldState>(CUSTOM_FIELD_FEATURE_KEY);

export const {
  selectIds: selectCustomFieldIds,
  selectEntities: selectCustomFieldEntities,
  selectAll: selectAllCustomFields,
  selectTotal: selectCustomFieldTotal,
} = adapter.getSelectors(selectCustomFieldState);

export const selectCustomFieldLoading = createSelector(
  selectCustomFieldState,
  state => state.loading
);

export const selectCustomFieldError = createSelector(
  selectCustomFieldState,
  state => state.error
);

export const selectCustomFieldTotalCount = createSelector(
  selectCustomFieldState,
  state => state.totalCount
);

export const selectCustomFieldPageNumber = createSelector(
  selectCustomFieldState,
  state => state.pageNumber
);

export const selectCustomFieldPageSize = createSelector(
  selectCustomFieldState,
  state => state.pageSize
);

export const selectCustomFieldTotalPages = createSelector(
  selectCustomFieldState,
  state => state.totalPages
);
