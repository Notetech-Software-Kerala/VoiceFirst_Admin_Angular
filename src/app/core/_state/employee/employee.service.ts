import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiConfig } from '../../_config/apiConfig';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { ApiResponse, PaginatedData } from '../../_models/api-response.model';
import { map } from 'rxjs/operators';
import { EmployeeModel } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getAll(queryParams: any): Observable<PaginatedData<EmployeeModel>> {
        let params = new HttpParams({ fromObject: queryParams });
        return this.http.get<ApiResponse<PaginatedData<EmployeeModel>>>(
            `${this.base}${apiConfig.employee}`, { params }
        ).pipe(
            map(response => response.data)
        );
    }

    create(data: any): Observable<ApiResponse<EmployeeModel>> {
        return this.http.post<ApiResponse<EmployeeModel>>(`${this.base}${apiConfig.employee}`, data);
    }

    update(id: number, data: any): Observable<ApiResponse<EmployeeModel>> {
        return this.http.patch<ApiResponse<EmployeeModel>>(`${this.base}${apiConfig.employee}/${id}`, data);
    }

    delete(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}${apiConfig.employee}/${id}`);
    }

    getById(id: number): Observable<ApiResponse<EmployeeModel>> {
        return this.http.get<ApiResponse<EmployeeModel>>(`${this.base}${apiConfig.employee}/${id}`);
    }

    restore(id: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.base}${apiConfig.employeeRestore}/${id}`, {});
    }

    lookup(queryParams?: any): Observable<ApiResponse<EmployeeModel>> {
        let params = queryParams ? new HttpParams({ fromObject: queryParams }) : new HttpParams();
        return this.http.get<ApiResponse<EmployeeModel>>(`${this.base}${apiConfig.getEmployeeLookup}`, { params });
    }
}
