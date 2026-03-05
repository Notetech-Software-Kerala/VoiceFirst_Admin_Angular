import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IssueMediaTypeActions } from './issue-media-type.action';
import { IssueMediaTypeState } from './issue-media-type.state';
import { IssueMediaTypeModel } from './issue-media-type.model';

export const adapter: EntityAdapter<IssueMediaTypeModel> =
  createEntityAdapter<IssueMediaTypeModel>({
    selectId: a => a.issueMediaTypeId,
  });

export const initialState: IssueMediaTypeState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const issueMediaTypeReducer = createReducer(
  initialState,

  on(IssueMediaTypeActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(IssueMediaTypeActions.loadSuccess, (state, { issueMediaTypes, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(issueMediaTypes, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(IssueMediaTypeActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(IssueMediaTypeActions.add, (state, { issueMediaType }) =>
    adapter.addOne(issueMediaType, state)
  ),

  on(IssueMediaTypeActions.update, (state, { issueMediaType }) =>
    adapter.updateOne(issueMediaType, state)
  ),

  on(IssueMediaTypeActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
