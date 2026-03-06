import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueMediaTypeModel } from './issue-media-type.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../../_models/api-response.model';
import { apiConfig } from '../../../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class IssueMediaTypeService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<IssueMediaTypeModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<IssueMediaTypeModel>>>(
      `${this.base}${apiConfig.issueMediaType}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<IssueMediaTypeModel>> {
    return this.http.post<ApiResponse<IssueMediaTypeModel>>(
      `${this.base}${apiConfig.issueMediaType}`,
      data
    )
  }

  update(id: number, data: Partial<IssueMediaTypeModel>): Observable<ApiResponse<IssueMediaTypeModel>> {
    return this.http.patch<ApiResponse<IssueMediaTypeModel>>(
      `${this.base}${apiConfig.issueMediaType}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.issueMediaType}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.issueMediaTypeRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<IssueMediaTypeModel[]>> {
    return this.http.get<ApiResponse<IssueMediaTypeModel[]>>(
      `${this.base}${apiConfig.getIssueMediaTypeLookup}`
    );
  }

}
