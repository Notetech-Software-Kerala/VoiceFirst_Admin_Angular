import { EntityState } from '@ngrx/entity';
import { BusinessActivityModel } from './business-activity.model';

export interface BusinessActivityState extends EntityState<BusinessActivityModel> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
