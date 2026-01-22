
import { EntityState } from '@ngrx/entity';
import { ProgramActionModel } from './program-action.model';


export interface ProgramActionState extends EntityState<ProgramActionModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
