import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IssueStatusActions } from './issue-status.action';
import { IssueStatusState } from './issue-status.state';
import { IssueStatusModel } from './issue-status.model';

export const adapter: EntityAdapter<IssueStatusModel> =
  createEntityAdapter<IssueStatusModel>({
    selectId: a => a.issueStatusId,
  });

export const initialState: IssueStatusState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const issueStatusReducer = createReducer(
  initialState,

  on(IssueStatusActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(IssueStatusActions.loadSuccess, (state, { issueStatus, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(issueStatus, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(IssueStatusActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssueStatusActions.add, (state, { issueStatus }) =>
    adapter.addOne(issueStatus, state)
  ),

  on(IssueStatusActions.update, (state, { issueStatus }) =>
    adapter.updateOne(issueStatus, state)
  ),

  on(IssueStatusActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
