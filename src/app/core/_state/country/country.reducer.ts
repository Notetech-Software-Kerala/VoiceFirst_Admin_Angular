import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { CountryActions } from './country.action';
import { CountryState } from './country.state';
import { CountryModel } from './country.model';

export const adapter: EntityAdapter<CountryModel> =
  createEntityAdapter<CountryModel>({
    selectId: a => a.countryId,
  });

export const initialState: CountryState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const countryReducer = createReducer(
  initialState,

  on(CountryActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(CountryActions.loadSuccess, (state, { activities, totalCount, pageNumber, pageSize, totalPages }) =>
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

  on(CountryActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CountryActions.add, (state, { activity }) =>
    adapter.addOne(activity, state)
  ),

  on(CountryActions.update, (state, { activity }) =>
    adapter.updateOne(activity, state)
  ),

  on(CountryActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
