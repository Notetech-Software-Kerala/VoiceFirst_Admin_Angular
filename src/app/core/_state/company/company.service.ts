import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { apiConfig } from '../../_config/apiConfig';
import { ApiResponse } from '../../_models/api-response.model';

export interface CompanyModel {
    companyId: number;
    companyName: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }

    lookup(): Observable<ApiResponse<CompanyModel[]>> {
        return this.http.get<ApiResponse<CompanyModel[]>>(
            `${this.base}${apiConfig.getCompanyLookup}`
        );
    }
}
