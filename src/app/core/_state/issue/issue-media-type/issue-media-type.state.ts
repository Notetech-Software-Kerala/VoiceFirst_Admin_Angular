
import { EntityState } from '@ngrx/entity';
import { IssueMediaTypeModel } from './issue-media-type.model';


export interface IssueMediaTypeState extends EntityState<IssueMediaTypeModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
