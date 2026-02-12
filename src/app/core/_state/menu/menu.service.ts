import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';
import { WebMenuModel, MasterMenuModel, AppMenuModel } from './menu.model';
import { QueryParameterModel } from '../../_models/query-parameter.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getAll(queryParams: QueryParameterModel): Observable<PaginatedData<MasterMenuModel>> {
        return this.http.get<ApiResponse<PaginatedData<MasterMenuModel>>>(
            `${this.base}${apiConfig.menuMaster}`,
            { params: queryParams as any }
        ).pipe(
            map(response => response.data)
        );
    }

    updateMasterMenu(id: number, data: Partial<MasterMenuModel>): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(
            `${this.base}${apiConfig.menuMaster}/${id}`,
            data
        );
    }

    getWebmenu(): Observable<WebMenuModel[]> {
        return this.http.get<ApiResponse<WebMenuModel[]>>(
            `${this.base}${apiConfig.menuWeb}`
        ).pipe(
            map(response => response.data)
        );
    }

    saveMenuOrder(payload: any): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(
            `${this.base}${apiConfig.webMenuBulkUpdate}`,
            payload
        );
    }


    getAppmenu(): Observable<AppMenuModel[]> {
        return this.http.get<ApiResponse<AppMenuModel[]>>(
            `${this.base}${apiConfig.menuApp}`
        ).pipe(
            map(response => response.data)
        );
    }

    saveAppMenuOrder(payload: any): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(
            `${this.base}${apiConfig.appMenuBulkUpdate}`,
            payload
        );
    }

    delete(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(
            `${this.base}${apiConfig.menu}/${id}`
        );
    }



}
