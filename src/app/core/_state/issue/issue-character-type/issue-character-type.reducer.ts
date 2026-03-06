import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IssueCharacterTypeActions } from './issue-character-type.action';
import { IssueCharacterTypeState } from './issue-character-type.state';
import { IssueCharacterTypeModel } from './issue-character-type.model';

export const adapter: EntityAdapter<IssueCharacterTypeModel> =
  createEntityAdapter<IssueCharacterTypeModel>({
    selectId: a => a.issueCharacterTypeId,
  });

export const initialState: IssueCharacterTypeState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const issueCharacterTypeReducer = createReducer(
  initialState,

  on(IssueCharacterTypeActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(IssueCharacterTypeActions.loadSuccess, (state, { issueCharacterTypes, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(issueCharacterTypes, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(IssueCharacterTypeActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssueCharacterTypeActions.add, (state, { issueCharacterType }) =>
    adapter.addOne(issueCharacterType, state)
  ),

  on(IssueCharacterTypeActions.update, (state, { issueCharacterType }) =>
    adapter.updateOne(issueCharacterType, state)
  ),

  on(IssueCharacterTypeActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
