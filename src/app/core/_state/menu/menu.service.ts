import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';
import { MenuModel } from './menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
    private base = environment.baseUrl;

    menu: MenuModel[] = [
        {
            "webMenuId": 1,
            "parentId": 0,
            "menuId": 1,
            "menuName": "Dashboard",
            "icon": "dashboard",
            "route": "/dashboard",
            "sortOrder": 1,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-01T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 2,
            "parentId": 0,
            "menuId": 2,
            "menuName": "Users",
            "icon": "users",
            "route": "/users",
            "sortOrder": 2,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-02T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 3,
            "parentId": 2,
            "menuId": 3,
            "menuName": "Add User",
            "icon": "user-plus",
            "route": "/users/add",
            "sortOrder": 1,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-03T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 4,
            "parentId": 2,
            "menuId": 4,
            "menuName": "User List",
            "icon": "list",
            "route": "/users/list",
            "sortOrder": 2,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-04T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 5,
            "parentId": 0,
            "menuId": 5,
            "menuName": "Settings",
            "icon": "settings",
            "route": "/settings",
            "sortOrder": 3,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-05T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 6,
            "parentId": 5,
            "menuId": 6,
            "menuName": "Roles",
            "icon": "shield",
            "route": "/settings/roles",
            "sortOrder": 1,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-06T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 7,
            "parentId": 5,
            "menuId": 7,
            "menuName": "Permissions",
            "icon": "lock",
            "route": "/settings/permissions",
            "sortOrder": 2,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-07T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 8,
            "parentId": 0,
            "menuId": 8,
            "menuName": "Reports",
            "icon": "bar-chart",
            "route": "/reports",
            "sortOrder": 4,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-08T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 9,
            "parentId": 8,
            "menuId": 9,
            "menuName": "Sales Report",
            "icon": "file-text",
            "route": "/reports/sales",
            "sortOrder": 1,
            "active": true,
            "deleted": false,
            "createdDate": "2026-01-09T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        },
        {
            "webMenuId": 10,
            "parentId": 8,
            "menuId": 10,
            "menuName": "User Report",
            "icon": "file",
            "route": "/reports/users",
            "sortOrder": 2,
            "active": false,
            "deleted": false,
            "createdDate": "2026-01-10T10:00:00.000",
            "createdUser": "Admin",
            "modifiedDate": null,
            "modifiedUser": " ",
            "deletedUser": " ",
            "deletedDate": null
        }
    ];
    menuMaster: MenuModel[] = [];

    constructor(private http: HttpClient) { }

    getWebmenu(): Observable<MenuModel[]> {
        return this.http.get<ApiResponse<MenuModel[]>>(
            `${this.base}${apiConfig.menuWeb}`
        ).pipe(
            map(response => response.data)
        );
    }

    saveMenuOrder(payload: any): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(
            `${this.base}${apiConfig.menuBulkUpdate}`,
            payload
        );
    }

}
