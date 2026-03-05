
import { EntityState } from '@ngrx/entity';
import { IssueTypeModel } from './issue-type.model';


export interface IssueTypeState extends EntityState<IssueTypeModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
