import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IssueTypeActions } from './issue-type.action';
import { IssueTypeState } from './issue-type.state';
import { IssueTypeModel } from './issue-type.model';

export const adapter: EntityAdapter<IssueTypeModel> =
  createEntityAdapter<IssueTypeModel>({
    selectId: a => a.issueTypeId,
  });

export const initialState: IssueTypeState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const issueTypeReducer = createReducer(
  initialState,

  on(IssueTypeActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(IssueTypeActions.loadSuccess, (state, { issueTypes, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(issueTypes, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(IssueTypeActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssueTypeActions.add, (state, { issueTypes }) =>
    adapter.addOne(issueTypes, state)
  ),

  on(IssueTypeActions.update, (state, { issueTypes }) =>
    adapter.updateOne(issueTypes, state)
  ),

  on(IssueTypeActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
