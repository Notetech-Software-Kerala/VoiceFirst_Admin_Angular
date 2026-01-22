import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PostOfficeModel } from './post-office.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PostOfficeService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<PostOfficeModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<PostOfficeModel>>>(
      `${this.base}${apiConfig.postOffice}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<PostOfficeModel>> {
    return this.http.post<ApiResponse<PostOfficeModel>>(
      `${this.base}${apiConfig.postOffice}`,
      data
    )
  }

  update(id: number, data: Partial<PostOfficeModel>): Observable<ApiResponse<PostOfficeModel>> {
    return this.http.patch<ApiResponse<PostOfficeModel>>(
      `${this.base}${apiConfig.postOffice}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.postOffice}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.postOfficeRestore}/${id}`,
      {}
    );
  }


}
