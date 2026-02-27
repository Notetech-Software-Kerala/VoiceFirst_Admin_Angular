import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CountryModel, DivisionOneModel, DivisionThreeModel, DivisionTwoModel } from './country.model';
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

  lookup(queryParams?: any): Observable<ApiResponse<CountryModel>> {
    let params = new HttpParams({
      fromObject: queryParams || {}
    });
    return this.http.get<ApiResponse<CountryModel>>(
      `${this.base}${apiConfig.getCountryLookup}`,
      { params }
    )
  }

  //----------------- Division One -----------------//

  getDivisionOne(queryParams: any): Observable<ApiResponse<any>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<any>>(
      `${this.base}${apiConfig.divisionOne}`,
      { params }
    )
  }

  getDivisionOneLookup(queryParams: any): Observable<ApiResponse<DivisionOneModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<DivisionOneModel>>(
      `${this.base}${apiConfig.getDivisionOneLookup}`,
      { params }
    )
  }

  //----------------- Division Two -----------------//

  getDivisionTwo(queryParams: any): Observable<ApiResponse<DivisionTwoModel[]>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<DivisionTwoModel[]>>(
      `${this.base}${apiConfig.divisionTwo}`,
      { params }
    )
  }

  getDivisionTwoLookup(queryParams: any): Observable<ApiResponse<DivisionTwoModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<DivisionTwoModel>>(
      `${this.base}${apiConfig.getDivisionTwoLookup}`,
      { params }
    )
  }

  //----------------- Division Three -----------------//

  getDivisionThree(queryParams: any): Observable<ApiResponse<DivisionThreeModel[]>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<DivisionThreeModel[]>>(
      `${this.base}${apiConfig.divisionThree}`,
      { params }
    )
  }

  getDivisionThreeLookup(queryParams: any): Observable<ApiResponse<DivisionThreeModel>> {
    let params = new HttpParams({
      fromObject: queryParams
    });
    return this.http.get<ApiResponse<DivisionThreeModel>>(
      `${this.base}${apiConfig.getDivisionThreeLookup}`,
      { params }
    )
  }

}
