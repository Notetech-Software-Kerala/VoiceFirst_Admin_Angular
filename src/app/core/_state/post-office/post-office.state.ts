
import { EntityState } from '@ngrx/entity';
import { PostOfficeModel } from './post-office.model';


export interface PostOfficeState extends EntityState<PostOfficeModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
