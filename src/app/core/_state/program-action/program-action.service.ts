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
    console.log("Query Params 22", queryParams);

    // Build HttpParams, only including parameters with values
    let params = new HttpParams({
      fromObject: queryParams
    });

    console.log("QueryParams", params);


    return this.http.get<ApiResponse<PaginatedData<ProgramActionModel>>>(
      `${this.base}${apiConfig.programAction}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: { programActionName: string }): Observable<ProgramActionModel> {
    return this.http.post<ApiResponse<ProgramActionModel>>(
      `${this.base}${apiConfig.programAction}`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  update(id: number, data: Partial<ProgramActionModel>): Observable<ProgramActionModel> {
    return this.http.put<ApiResponse<ProgramActionModel>>(
      `${this.base}${apiConfig.programAction}/${id}`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}${apiConfig.programAction}/${id}`
    );
  }
}
