
import { EntityState } from '@ngrx/entity';
import { RoleModel } from './role.model';


export interface RoleState extends EntityState<RoleModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
