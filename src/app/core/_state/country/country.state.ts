
import { EntityState } from '@ngrx/entity';
import { CountryModel } from './country.model';


export interface CountryState extends EntityState<CountryModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
