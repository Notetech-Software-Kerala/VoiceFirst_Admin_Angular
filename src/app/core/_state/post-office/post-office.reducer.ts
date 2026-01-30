import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { PostOfficeActions } from './post-office.action';

import { PostOfficeModel } from './post-office.model';
import { PostOfficeState } from './post-office.state';

export const adapter: EntityAdapter<PostOfficeModel> =
  createEntityAdapter<PostOfficeModel>({
    selectId: a => a.postOfficeId,
  });

export const initialState: PostOfficeState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const postOfficeReducer = createReducer(
  initialState,

  on(PostOfficeActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(PostOfficeActions.loadSuccess, (state, { postOffices, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(postOffices, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(PostOfficeActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PostOfficeActions.add, (state, { postOffice }) =>
    adapter.addOne(postOffice, state)
  ),

  on(PostOfficeActions.update, (state, { postOffice }) =>
    adapter.updateOne(postOffice, state)
  ),

  on(PostOfficeActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
