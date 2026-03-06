import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueMediaFormatModel } from './issue-media-format.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../../_models/api-response.model';
import { apiConfig } from '../../../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class IssueMediaFormatService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<IssueMediaFormatModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<IssueMediaFormatModel>>>(
      `${this.base}${apiConfig.issueMediaFormat}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<IssueMediaFormatModel>> {
    return this.http.post<ApiResponse<IssueMediaFormatModel>>(
      `${this.base}${apiConfig.issueMediaFormat}`,
      data
    )
  }

  update(id: number, data: Partial<IssueMediaFormatModel>): Observable<ApiResponse<IssueMediaFormatModel>> {
    return this.http.patch<ApiResponse<IssueMediaFormatModel>>(
      `${this.base}${apiConfig.issueMediaFormat}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.issueMediaFormat}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.issueMediaFormatRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<IssueMediaFormatModel[]>> {
    return this.http.get<ApiResponse<IssueMediaFormatModel[]>>(
      `${this.base}${apiConfig.getIssueMediaFormatLookup}`
    );
  }

}
