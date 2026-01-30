import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';
import { RoleModel } from './role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<RoleModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<RoleModel>>>(
      `${this.base}${apiConfig.role}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<RoleModel>> {
    return this.http.post<ApiResponse<RoleModel>>(
      `${this.base}${apiConfig.role}`,
      data
    )
  }

  update(id: number, data: Partial<RoleModel>): Observable<ApiResponse<RoleModel>> {
    return this.http.patch<ApiResponse<RoleModel>>(
      `${this.base}${apiConfig.role}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.role}/${id}`
    );
  }

  getById(id: number): Observable<ApiResponse<RoleModel>> {
    return this.http.get<ApiResponse<RoleModel>>(
      `${this.base}${apiConfig.role}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.roleRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<RoleModel>> {
    return this.http.get<ApiResponse<RoleModel>>(
      `${this.base}${apiConfig.getRoleLookup}`
    )
  }


}
