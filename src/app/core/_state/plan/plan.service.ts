import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanModel } from './plan.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<PlanModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<PlanModel>>>(
      `${this.base}${apiConfig.plan}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<PlanModel>> {
    return this.http.post<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.plan}`,
      data
    )
  }

  update(id: number, data: Partial<PlanModel>): Observable<ApiResponse<PlanModel>> {
    return this.http.patch<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.plan}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<PlanModel>> {
    return this.http.delete<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.plan}/${id}`
    );
  }

  getById(id: number): Observable<ApiResponse<PlanModel>> {
    return this.http.get<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.plan}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.planRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<PlanModel>> {
    return this.http.get<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.getPlanLookup}`
    )
  }

  getProgramDetailsByPlanId(id: number): Observable<ApiResponse<PlanModel>> {
    return this.http.get<ApiResponse<PlanModel>>(
      `${this.base}${apiConfig.getProgramDetailsByPlanId}/${id}`
    )
  }


}
