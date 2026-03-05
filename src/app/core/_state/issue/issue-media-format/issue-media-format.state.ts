
import { EntityState } from '@ngrx/entity';
import { IssueMediaFormatModel } from './issue-media-format.model';


export interface IssueMediaFormatState extends EntityState<IssueMediaFormatModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
