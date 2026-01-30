import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CountryModel } from './country.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const CountryActions = createActionGroup({
  source: 'Country',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      countries: CountryModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ country: CountryModel }>(),
    'Update': props<{ country: Update<CountryModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
