import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IssueCharacterTypeModel } from './issue-character-type.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedData } from '../../../_models/api-response.model';
import { apiConfig } from '../../../_config/apiConfig';

@Injectable({ providedIn: 'root' })
export class IssueCharacterTypeService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<IssueCharacterTypeModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<IssueCharacterTypeModel>>>(
      `${this.base}${apiConfig.issueCharacterType}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<IssueCharacterTypeModel>> {
    return this.http.post<ApiResponse<IssueCharacterTypeModel>>(
      `${this.base}${apiConfig.issueCharacterType}`,
      data
    )
  }

  update(id: number, data: Partial<IssueCharacterTypeModel>): Observable<ApiResponse<IssueCharacterTypeModel>> {
    return this.http.patch<ApiResponse<IssueCharacterTypeModel>>(
      `${this.base}${apiConfig.issueCharacterType}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.issueCharacterType}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.issueCharacterTypeRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<IssueCharacterTypeModel[]>> {
    return this.http.get<ApiResponse<IssueCharacterTypeModel[]>>(
      `${this.base}${apiConfig.getIssueCharacterTypeLookup}`
    );
  }

}
