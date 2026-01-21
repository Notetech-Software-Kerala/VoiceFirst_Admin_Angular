import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramActionModel } from './program-action.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProgramActionService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<ProgramActionModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<ProgramActionModel>>>(
      `${this.base}${apiConfig.programAction}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<ProgramActionModel>> {
    return this.http.post<ApiResponse<ProgramActionModel>>(
      `${this.base}${apiConfig.programAction}`,
      data
    )
  }

  update(id: number, data: Partial<ProgramActionModel>): Observable<ApiResponse<ProgramActionModel>> {
    return this.http.patch<ApiResponse<ProgramActionModel>>(
      `${this.base}${apiConfig.programAction}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.programAction}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.programActionRestore}/${id}`,
      {}
    );
  }


}
