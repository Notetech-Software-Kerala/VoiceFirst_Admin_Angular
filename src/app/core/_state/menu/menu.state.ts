
import { EntityState } from '@ngrx/entity';
import { MasterMenuModel } from './menu.model';



export interface MenuState extends EntityState<MasterMenuModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
