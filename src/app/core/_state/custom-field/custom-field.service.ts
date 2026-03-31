import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomFieldModel } from './custom-field.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomFieldService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<CustomFieldModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<CustomFieldModel>>>(
      `${this.base}${apiConfig.customField}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  lookup(): Observable<ApiResponse<CustomFieldModel[]>> {
    let params = new HttpParams().set('Limit', 1000); // Fetch all custom fields for options
    return this.http.get<ApiResponse<CustomFieldModel[]>>(
      `${this.base}${apiConfig.customField}`,
      { params }
    );
  }

  getById(id: number): Observable<ApiResponse<CustomFieldModel>> {
    return this.http.get<ApiResponse<CustomFieldModel>>(
      `${this.base}${apiConfig.customField}/${id}`
    );
  }

  create(data: any): Observable<ApiResponse<CustomFieldModel>> {
    return this.http.post<ApiResponse<CustomFieldModel>>(
      `${this.base}${apiConfig.customField}`,
      data
    )
  }

  update(id: number, data: Partial<CustomFieldModel>): Observable<ApiResponse<CustomFieldModel>> {
    return this.http.patch<ApiResponse<CustomFieldModel>>(
      `${this.base}${apiConfig.customField}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.customField}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.customFieldRestore}/${id}`,
      {}
    );
  }

  dataTypeLookup(): Observable<ApiResponse<CustomFieldModel[]>> {
    return this.http.get<ApiResponse<CustomFieldModel[]>>(
      `${this.base}${apiConfig.customFieldDataType}`,
    );
  }

  validationRuleLookup(queryParams: any): Observable<ApiResponse<CustomFieldModel[]>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<CustomFieldModel[]>>(
      `${this.base}${apiConfig.customFieldValidationRule}`,
      { params }
    );
  }
}
