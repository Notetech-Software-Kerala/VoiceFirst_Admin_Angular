
import { EntityState } from '@ngrx/entity';
import { IssueCharacterTypeModel } from './issue-character-type.model';


export interface IssueCharacterTypeState extends EntityState<IssueCharacterTypeModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
