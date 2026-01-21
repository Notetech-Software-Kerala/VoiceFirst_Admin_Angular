import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BusinessActivityModel } from './business-activity.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BusinessActivityService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<BusinessActivityModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<BusinessActivityModel>>>(
      `${this.base}${apiConfig.businessActivity}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<BusinessActivityModel>> {
    return this.http.post<ApiResponse<BusinessActivityModel>>(
      `${this.base}${apiConfig.businessActivity}`,
      data
    )
  }

  update(id: number, data: Partial<BusinessActivityModel>): Observable<ApiResponse<BusinessActivityModel>> {
    return this.http.patch<ApiResponse<BusinessActivityModel>>(
      `${this.base}${apiConfig.businessActivity}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.businessActivity}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.businessActivityRestore}/${id}`,
      {}
    );
  }
}
