import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IssueMediaFormatActions } from './issue-media-format.action';
import { IssueMediaFormatState } from './issue-media-format.state';
import { IssueMediaFormatModel } from './issue-media-format.model';

export const adapter: EntityAdapter<IssueMediaFormatModel> =
  createEntityAdapter<IssueMediaFormatModel>({
    selectId: a => a.issueMediaFormatId,
  });

export const initialState: IssueMediaFormatState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const issueMediaFormatReducer = createReducer(
  initialState,

  on(IssueMediaFormatActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(IssueMediaFormatActions.loadSuccess, (state, { issueMediaFormats, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(issueMediaFormats, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(IssueMediaFormatActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssueMediaFormatActions.add, (state, { issueMediaFormat }) =>
    adapter.addOne(issueMediaFormat, state)
  ),

  on(IssueMediaFormatActions.update, (state, { issueMediaFormat }) =>
    adapter.updateOne(issueMediaFormat, state)
  ),

  on(IssueMediaFormatActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
