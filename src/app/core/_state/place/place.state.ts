
import { EntityState } from '@ngrx/entity';
import { PlaceModel } from './place.model';


export interface PlaceState extends EntityState<PlaceModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
