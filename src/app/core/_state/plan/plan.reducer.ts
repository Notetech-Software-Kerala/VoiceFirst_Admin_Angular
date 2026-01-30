import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { PlanActions } from './plan.action';
import { PlanState } from './plan.state';
import { PlanModel } from './plan.model';

export const adapter: EntityAdapter<PlanModel> =
  createEntityAdapter<PlanModel>({
    selectId: a => a.planId,
  });

export const initialState: PlanState =
  adapter.getInitialState({
    loading: false,
    error: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

export const planReducer = createReducer(
  initialState,

  on(PlanActions.load, state => ({
    ...state,
    loading: true,
  })),

  on(PlanActions.loadSuccess, (state, { plans, totalCount, pageNumber, pageSize, totalPages }) =>
    adapter.setAll(plans, {
      ...state,
      loading: false,
      error: null,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    })
  ),

  on(PlanActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlanActions.add, (state, { plan }) =>
    adapter.addOne(plan, state)
  ),

  on(PlanActions.update, (state, { plan }) =>
    adapter.updateOne(plan, state)
  ),

  on(PlanActions.delete, (state, { id }) =>
    adapter.removeOne(id, state)
  )
);
