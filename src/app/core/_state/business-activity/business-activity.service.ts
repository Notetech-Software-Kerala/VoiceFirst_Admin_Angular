import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BusinessActivityModel } from './business-activity.model';

@Injectable({ providedIn: 'root' })
export class BusinessActivityService {

  getAll(): Observable<BusinessActivityModel[]> {
    return of([
      {
        "Id": 1,
        "Name": "Sales",
        "Active": true,
        "Delete": false,
        "CreatedUser": "admin",
        "CreatedDate": "2026-01-01T09:00:00Z",
        "ModifiedUser": "admin",
        "ModifiedDate": "2026-01-05T10:15:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 2,
        "Name": "Marketing",
        "Active": true,
        "Delete": false,
        "CreatedUser": "john.doe",
        "CreatedDate": "2026-01-02T11:30:00Z",
        "ModifiedUser": "",
        "ModifiedDate": null,
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 3,
        "Name": "Operations",
        "Active": false,
        "Delete": false,
        "CreatedUser": "jane.smith",
        "CreatedDate": "2026-01-03T08:20:00Z",
        "ModifiedUser": "jane.smith",
        "ModifiedDate": "2026-01-12T16:40:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 4,
        "Name": "Customer Support",
        "Active": true,
        "Delete": false,
        "CreatedUser": "support.lead",
        "CreatedDate": "2026-01-04T14:10:00Z",
        "ModifiedUser": "support.manager",
        "ModifiedDate": "2026-01-14T06:30:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 5,
        "Name": "Finance",
        "Active": true,
        "Delete": false,
        "CreatedUser": "finance.user",
        "CreatedDate": "2026-01-05T10:05:00Z",
        "ModifiedUser": "finance.manager",
        "ModifiedDate": "2026-01-16T09:25:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 6,
        "Name": "Human Resources",
        "Active": true,
        "Delete": false,
        "CreatedUser": "hr.user",
        "CreatedDate": "2026-01-06T13:45:00Z",
        "ModifiedUser": "",
        "ModifiedDate": null,
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 7,
        "Name": "IT Services",
        "Active": true,
        "Delete": false,
        "CreatedUser": "it.admin",
        "CreatedDate": "2026-01-07T07:50:00Z",
        "ModifiedUser": "it.admin",
        "ModifiedDate": "2026-01-17T18:10:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 8,
        "Name": "Procurement",
        "Active": false,
        "Delete": true,
        "CreatedUser": "proc.user",
        "CreatedDate": "2026-01-08T12:00:00Z",
        "ModifiedUser": "proc.manager",
        "ModifiedDate": "2026-01-18T15:30:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 9,
        "Name": "Logistics",
        "Active": true,
        "Delete": false,
        "CreatedUser": "log.user",
        "CreatedDate": "2026-01-09T16:25:00Z",
        "ModifiedUser": "log.manager",
        "ModifiedDate": "2026-01-19T08:45:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      },
      {
        "Id": 10,
        "Name": "Research & Development",
        "Active": true,
        "Delete": false,
        "CreatedUser": "rnd.user",
        "CreatedDate": "2026-01-10T09:35:00Z",
        "ModifiedUser": "rnd.lead",
        "ModifiedDate": "2026-01-19T11:20:00Z",
        "DeletedUser": "",
        "DeletedDate": null
      }
    ]
    ).pipe(delay(3000));
  }
}
