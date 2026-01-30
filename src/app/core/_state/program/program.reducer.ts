import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { ProgramActions } from './program.action';
import { ProgramState } from './program.state';
import { ProgramModel } from './program.model';

export const adapter: EntityAdapter<ProgramModel> =
  createEntityAdapter<ProgramModel>({
    selectId: a => a.programId,
  });

export const initialState: ProgramState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const programReducer = createReducer(
  initialState,

  on(ProgramActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(ProgramActions.loadSuccess, (state, { programs, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(programs, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(ProgramActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProgramActions.add, (state, { program }) =>
    adapter.addOne(program, state)
  ),

  on(ProgramActions.update, (state, { program }) =>
    adapter.updateOne(program, state)
  ),

  on(ProgramActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
