import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiConfig } from '../../_config/apiConfig';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private base = environment.baseUrl;

    constructor(private http: HttpClient) { }

    /**
     * Retrieves the current authenticated user's profile information.
     */
    getCurrentUser(): Observable<any> {
        return this.http.get<any>(`${this.base}${apiConfig.user}`);
    }

    updateCurrentUser(data: any): Observable<any> {
        return this.http.patch<any>(`${this.base}${apiConfig.user}`, data);
    }
}
