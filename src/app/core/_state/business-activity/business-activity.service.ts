import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BusinessActivityModel } from './business-activity.model';

@Injectable({ providedIn: 'root' })
export class BusinessActivityService {

  getAll(): Observable<BusinessActivityModel[]> {
    return of([
      {
        "sysBusinessActivityId": 1,
        "businessActivityName": "Sales",
        "createdBy": "admin",
        "createdAt": "2026-01-01T09:00:00Z",
        "isActive": true,
        "updatedBy": "admin",
        "updatedAt": "2026-01-05T10:15:00Z"
      },
      {
        "sysBusinessActivityId": 2,
        "businessActivityName": "Marketing",
        "createdBy": "john.doe",
        "createdAt": "2026-01-02T11:30:00Z",
        "isActive": true,
        "updatedBy": null,
        "updatedAt": null
      },
      {
        "sysBusinessActivityId": 3,
        "businessActivityName": "Operations",
        "createdBy": "jane.smith",
        "createdAt": "2026-01-03T08:20:00Z",
        "isActive": false,
        "updatedBy": "jane.smith",
        "updatedAt": "2026-01-12T16:40:00Z"
      },
      {
        "sysBusinessActivityId": 4,
        "businessActivityName": "Customer Support",
        "createdBy": "support.lead",
        "createdAt": "2026-01-04T14:10:00Z",
        "isActive": true,
        "updatedBy": "support.manager",
        "updatedAt": "2026-01-14T06:30:00Z"
      },
      {
        "sysBusinessActivityId": 5,
        "businessActivityName": "Finance",
        "createdBy": "finance.user",
        "createdAt": "2026-01-05T10:05:00Z",
        "isActive": true,
        "updatedBy": "finance.manager",
        "updatedAt": "2026-01-16T09:25:00Z"
      },
      {
        "sysBusinessActivityId": 6,
        "businessActivityName": "Human Resources",
        "createdBy": "hr.user",
        "createdAt": "2026-01-06T13:45:00Z",
        "isActive": true,
        "updatedBy": null,
        "updatedAt": null
      },
      {
        "sysBusinessActivityId": 7,
        "businessActivityName": "IT Services",
        "createdBy": "it.admin",
        "createdAt": "2026-01-07T07:50:00Z",
        "isActive": true,
        "updatedBy": "it.admin",
        "updatedAt": "2026-01-17T18:10:00Z"
      },
      {
        "sysBusinessActivityId": 8,
        "businessActivityName": "Procurement",
        "createdBy": "proc.user",
        "createdAt": "2026-01-08T12:00:00Z",
        "isActive": false,
        "updatedBy": "proc.manager",
        "updatedAt": "2026-01-18T15:30:00Z"
      },
      {
        "sysBusinessActivityId": 9,
        "businessActivityName": "Logistics",
        "createdBy": "log.user",
        "createdAt": "2026-01-09T16:25:00Z",
        "isActive": true,
        "updatedBy": "log.manager",
        "updatedAt": "2026-01-19T08:45:00Z"
      },
      {
        "sysBusinessActivityId": 10,
        "businessActivityName": "Research & Development",
        "createdBy": "rnd.user",
        "createdAt": "2026-01-10T09:35:00Z",
        "isActive": true,
        "updatedBy": "rnd.lead",
        "updatedAt": "2026-01-19T11:20:00Z"
      }
    ]
    ).pipe(delay(3000));
  }
}
