
import { EntityState } from '@ngrx/entity';
import { ProgramModel } from './program.model';


export interface ProgramState extends EntityState<ProgramModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
