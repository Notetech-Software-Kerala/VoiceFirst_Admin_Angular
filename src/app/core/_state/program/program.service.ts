import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramModel } from './program.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<ProgramModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<ProgramModel>>>(
      `${this.base}${apiConfig.program}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<ProgramModel>> {
    return this.http.post<ApiResponse<ProgramModel>>(
      `${this.base}${apiConfig.program}`,
      data
    )
  }

  update(id: number, data: Partial<ProgramModel>): Observable<ApiResponse<ProgramModel>> {
    return this.http.patch<ApiResponse<ProgramModel>>(
      `${this.base}${apiConfig.program}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.program}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.programRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<ProgramModel>> {
    return this.http.get<ApiResponse<ProgramModel>>(
      `${this.base}${apiConfig.getProgramLookup}`
    )
  }


}
