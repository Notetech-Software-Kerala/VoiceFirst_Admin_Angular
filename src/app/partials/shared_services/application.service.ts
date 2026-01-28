// src/app/core/validation.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { apiConfig } from '../../core/_config/apiConfig';
import { ApiResponse } from '../../core/_auth/auth.model';
import { Observable } from 'rxjs';

export interface ApplicationModel {
    platformId: number,
    platformName: string
}

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {

    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }


    lookup(): Observable<ApiResponse<ApplicationModel>> {
        return this.http.get<ApiResponse<ApplicationModel>>(
            `${this.base}${apiConfig.getCountryLookup}`
        )
    }
}
