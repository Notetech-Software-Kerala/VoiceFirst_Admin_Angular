
import { EntityState } from '@ngrx/entity';
import { IssueStatusModel } from './issue-status.model';


export interface IssueStatusState extends EntityState<IssueStatusModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
