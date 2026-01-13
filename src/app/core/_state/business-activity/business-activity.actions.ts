import { createActionGroup, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { BusinessActivityModel } from './business-activity.model';


export const BusinessActivityActions = createActionGroup({
  source: 'Business Activity',

  events: {
    'Load': props<any>(),
    'Load Success': props<{ activities: BusinessActivityModel[] }>(),
    'Load Failure': props<{ error: string }>(),
    'Add': props<{ activity: BusinessActivityModel }>(),
    'Update': props<{ activity: Update<BusinessActivityModel> }>(),
    'Delete': props<{ id: number }>(),
  },
});
