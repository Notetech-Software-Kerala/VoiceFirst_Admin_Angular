import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BusinessActivityModel } from './business-activity.model';

@Injectable({ providedIn: 'root' })
export class BusinessActivityService {

  getAll(): Observable<BusinessActivityModel[]> {
    return of([
      {
        "company_business_activity_id": 1,
        "name": "Restroom",
        "in_company": true,
        "in_branch": true,
        "in_section": true,
        "in_sub_section": true
      },
      {
        "company_business_activity_id": 2,
        "name": "Cafeteria",
        "in_company": true,
        "in_branch": true,
        "in_section": false,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 3,
        "name": "Parking",
        "in_company": true,
        "in_branch": false,
        "in_section": false,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 4,
        "name": "Reception",
        "in_company": true,
        "in_branch": true,
        "in_section": true,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 5,
        "name": "Warehouse",
        "in_company": true,
        "in_branch": true,
        "in_section": false,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 6,
        "name": "IT Room",
        "in_company": true,
        "in_branch": true,
        "in_section": true,
        "in_sub_section": true
      },
      {
        "company_business_activity_id": 7,
        "name": "Security Office",
        "in_company": true,
        "in_branch": false,
        "in_section": true,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 8,
        "name": "Training Hall",
        "in_company": true,
        "in_branch": true,
        "in_section": false,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 9,
        "name": "HR Office",
        "in_company": true,
        "in_branch": true,
        "in_section": true,
        "in_sub_section": false
      },
      {
        "company_business_activity_id": 10,
        "name": "Storage Room",
        "in_company": true,
        "in_branch": true,
        "in_section": false,
        "in_sub_section": true
      }
    ]);
  }
}
