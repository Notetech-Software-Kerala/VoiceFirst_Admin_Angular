import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { ProgramActionActions } from './issue-character-type.action';
import { ProgramActionState } from './issue-character-type.state';
import { IssueCharacterTypeModel } from './issue-character-type.model';

export const adapter: EntityAdapter<IssueCharacterTypeModel> =
  createEntityAdapter<IssueCharacterTypeModel>({
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

  on(ProgramActionActions.loadSuccess, (state, { programActions, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(programActions, {
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

  on(ProgramActionActions.add, (state, { programAction }) =>
    adapter.addOne(programAction, state)
  ),

  on(ProgramActionActions.update, (state, { programAction }) =>
    adapter.updateOne(programAction, state)
  ),

  on(ProgramActionActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
