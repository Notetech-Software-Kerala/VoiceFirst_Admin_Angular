import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueTypeModel } from './issue-type.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../../_models/api-response.model';
import { apiConfig } from '../../../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class IssueTypeService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<IssueTypeModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<IssueTypeModel>>>(
      `${this.base}${apiConfig.issueType}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<IssueTypeModel>> {
    return this.http.post<ApiResponse<IssueTypeModel>>(
      `${this.base}${apiConfig.issueType}`,
      data
    )
  }

  update(id: number, data: Partial<IssueTypeModel>): Observable<ApiResponse<IssueTypeModel>> {
    return this.http.patch<ApiResponse<IssueTypeModel>>(
      `${this.base}${apiConfig.issueType}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.issueType}/${id}`
    );
  }

  getById(id: number): Observable<ApiResponse<IssueTypeModel>> {
    return this.http.get<ApiResponse<IssueTypeModel>>(
      `${this.base}${apiConfig.issueType}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.issueTypeRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<IssueTypeModel[]>> {
    return this.http.get<ApiResponse<IssueTypeModel[]>>(
      `${this.base}${apiConfig.getIssueTypeLookup}`
    );
  }

}
