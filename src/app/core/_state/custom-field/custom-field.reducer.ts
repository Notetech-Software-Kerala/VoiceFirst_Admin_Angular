import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { CustomFieldActions } from './custom-field.actions';
import { CustomFieldState } from './custom-field.state';
import { CustomFieldModel } from './custom-field.model';

export const adapter: EntityAdapter<CustomFieldModel> =
  createEntityAdapter<CustomFieldModel>({
    selectId: a => a.customFieldId,
  });

export const initialState: CustomFieldState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const customFieldReducer = createReducer(
  initialState,

  on(CustomFieldActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(CustomFieldActions.loadSuccess, (state, { customFields, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(customFields, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(CustomFieldActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CustomFieldActions.add, (state, { customField }) =>
    adapter.addOne(customField, state)
  ),

  on(CustomFieldActions.update, (state, { customField }) =>
    adapter.updateOne(customField, state)
  ),

  on(CustomFieldActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
