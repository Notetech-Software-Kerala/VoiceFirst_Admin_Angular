import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaceModel } from './place.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlaceService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<PlaceModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<PlaceModel>>>(
      `${this.base}${apiConfig.place}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  create(data: any): Observable<ApiResponse<PlaceModel>> {
    return this.http.post<ApiResponse<PlaceModel>>(
      `${this.base}${apiConfig.place}`,
      data
    )
  }

  update(id: number, data: Partial<PlaceModel>): Observable<ApiResponse<PlaceModel>> {
    return this.http.patch<ApiResponse<PlaceModel>>(
      `${this.base}${apiConfig.place}/${id}`,
      data
    )
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}${apiConfig.place}/${id}`
    );
  }

  getById(id: number): Observable<ApiResponse<PlaceModel>> {
    return this.http.get<ApiResponse<PlaceModel>>(
      `${this.base}${apiConfig.place}/${id}`
    );
  }

  restore(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}${apiConfig.placeRestore}/${id}`,
      {}
    );
  }

  lookup(): Observable<ApiResponse<PlaceModel[]>> {
    return this.http.get<ApiResponse<PlaceModel[]>>(
      `${this.base}${apiConfig.getPlaceLookup}`
    )
  }


}
