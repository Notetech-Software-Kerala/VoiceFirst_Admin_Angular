// src/app/core/validation.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { apiConfig } from '../../_config/apiConfig';

export interface PlatformModel {
    platformId: number,
    platformName: string
}

@Injectable({
    providedIn: 'root'
})
export class PlatformService {

    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }


    lookup(): Observable<any> {
        return this.http.get<any>(
            `${this.base}${apiConfig.getApplicationLookup}`
        )
    }
}
