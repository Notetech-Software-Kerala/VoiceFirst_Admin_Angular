import { EntityState } from '@ngrx/entity';
import { CustomFieldModel } from './custom-field.model';

export interface CustomFieldState extends EntityState<CustomFieldModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
