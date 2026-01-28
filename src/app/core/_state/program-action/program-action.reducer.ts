import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { ProgramActionActions } from './program-action.action';
import { ProgramActionState } from './program-action.state';
import { ProgramActionModel } from './program-action.model';

export const adapter: EntityAdapter<ProgramActionModel> =
  createEntityAdapter<ProgramActionModel>({
    selectId: a => a.actionId,
  });

export const initialState: ProgramActionState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const programActionReducer = createReducer(
  initialState,

  on(ProgramActionActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(ProgramActionActions.loadSuccess, (state, { activities, totalCount, pageNumber, pageSize, totalPages }) =>
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

  on(ProgramActionActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProgramActionActions.add, (state, { activity }) =>
    adapter.addOne(activity, state)
  ),

  on(ProgramActionActions.update, (state, { activity }) =>
    adapter.updateOne(activity, state)
  ),

  on(ProgramActionActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
