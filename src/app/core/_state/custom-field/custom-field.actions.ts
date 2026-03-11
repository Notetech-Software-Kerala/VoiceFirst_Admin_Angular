import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CustomFieldModel } from './custom-field.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';


export const CustomFieldActions = createActionGroup({
  source: 'Custom Field',

  events: {
    'Load': props<{ queryParams: QueryParameterModel }>(),
    'Load Success': props<{
      customFields: CustomFieldModel[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ customField: CustomFieldModel }>(),
    'Update': props<{ customField: Update<CustomFieldModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
