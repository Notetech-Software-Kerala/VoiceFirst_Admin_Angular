import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { BusinessActivityActions } from './business-activity.actions';
import { BusinessActivityState } from './business-activity.state';
import { BusinessActivityModel } from './business-activity.model';

export const adapter: EntityAdapter<BusinessActivityModel> =
  createEntityAdapter<BusinessActivityModel>({
    selectId: a => a.activityId,
  });

export const initialState: BusinessActivityState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const businessActivityReducer = createReducer(
  initialState,

  on(BusinessActivityActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(BusinessActivityActions.loadSuccess, (state, { activities, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(activities, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(BusinessActivityActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BusinessActivityActions.add, (state, { activity }) =>
    adapter.addOne(activity, state)
  ),

  on(BusinessActivityActions.update, (state, { activity }) =>
    adapter.updateOne(activity, state)
  ),

  on(BusinessActivityActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
