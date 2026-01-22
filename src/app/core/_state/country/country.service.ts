import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CountryModel } from './country.model';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAll(queryParams: any): Observable<PaginatedData<CountryModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<PaginatedData<CountryModel>>>(
      `${this.base}${apiConfig.country}`,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  lookup(): Observable<ApiResponse<CountryModel>> {
    return this.http.get<ApiResponse<CountryModel>>(
      `${this.base}${apiConfig.getCountryLookup}`
    )
  }

  // create(data: any): Observable<ApiResponse<CountryModel>> {
  //   return this.http.post<ApiResponse<CountryModel>>(
  //     `${this.base}${apiConfig.country}`,
  //     data
  //   )
  // }

  // update(id: number, data: Partial<CountryModel>): Observable<ApiResponse<CountryModel>> {
  //   return this.http.patch<ApiResponse<CountryModel>>(
  //     `${this.base}${apiConfig.country}/${id}`,
  //     data
  //   )
  // }

  // delete(id: number): Observable<ApiResponse<void>> {
  //   return this.http.delete<ApiResponse<void>>(
  //     `${this.base}${apiConfig.country}/${id}`
  //   );
  // }

  // restore(id: number): Observable<ApiResponse<void>> {
  //   return this.http.patch<ApiResponse<void>>(
  //     `${this.base}${apiConfig.countryRestore}/${id}`,
  //     {}
  //   );
  // }


}
