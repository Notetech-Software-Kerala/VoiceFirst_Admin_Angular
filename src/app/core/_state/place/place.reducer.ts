import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { PlaceActions } from './place.action';
import { PlaceState } from './place.state';
import { PlaceModel } from './place.model';

export const adapter: EntityAdapter<PlaceModel> =
  createEntityAdapter<PlaceModel>({
    selectId: a => a.placeId,
  });

export const initialState: PlaceState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const placeReducer = createReducer(
  initialState,

  on(PlaceActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(PlaceActions.loadSuccess, (state, { places, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(places, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(PlaceActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceActions.add, (state, { place }) =>
    adapter.addOne(place, state)
  ),

  on(PlaceActions.update, (state, { place }) =>
    adapter.updateOne(place, state)
  ),

  on(PlaceActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
