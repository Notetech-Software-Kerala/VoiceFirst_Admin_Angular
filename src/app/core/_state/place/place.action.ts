import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PlaceModel } from './place.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const PlaceActions = createActionGroup({
  source: 'Place',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      places: PlaceModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ place: PlaceModel }>(),
    'Update': props<{ place: Update<PlaceModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
