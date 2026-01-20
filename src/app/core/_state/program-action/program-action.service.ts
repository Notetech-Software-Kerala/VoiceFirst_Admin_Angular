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
    // Build HttpParams, only including parameters with values
    let params = new HttpParams();

    // Only add parameters that have meaningful values
    if (queryParams.SortBy) {
      params = params.set('SortBy', queryParams.SortBy);
    }
    if (queryParams.SortOrder) {
      params = params.set('SortOrder', queryParams.SortOrder);
    }
    if (queryParams.SearchText) {
      params = params.set('SearchText', queryParams.SearchText);
    }
    if (queryParams.PageNumber && queryParams.PageNumber > 0) {
      params = params.set('PageNumber', queryParams.PageNumber.toString());
    }
    if (queryParams.Limit && queryParams.Limit > 0) {
      params = params.set('Limit', queryParams.Limit.toString());
    }

    console.log("QueryParams", queryParams);


    return this.http.get<ApiResponse<PaginatedData<ProgramActionModel>>>(
      `${this.base}${apiConfig.programAction}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }
}
