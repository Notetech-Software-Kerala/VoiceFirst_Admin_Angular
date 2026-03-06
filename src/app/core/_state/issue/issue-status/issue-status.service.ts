import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueStatusModel } from './issue-status.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../../_models/api-response.model';
import { apiConfig } from '../../../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class IssueStatusService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<IssueStatusModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<IssueStatusModel>>>(
      `${this.base}${apiConfig.issueStatus}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<IssueStatusModel>> {
    return this.http.post<ApiResponse<IssueStatusModel>>(
      `${this.base}${apiConfig.issueStatus}`,
      data
    )
  }

  update(id: number, data: Partial<IssueStatusModel>): Observable<ApiResponse<IssueStatusModel>> {
    return this.http.patch<ApiResponse<IssueStatusModel>>(
      `${this.base}${apiConfig.issueStatus}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.issueStatus}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.issueStatusRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<IssueStatusModel[]>> {
    return this.http.get<ApiResponse<IssueStatusModel[]>>(
      `${this.base}${apiConfig.getIssueStatusLookup}`
    );
  }

}
