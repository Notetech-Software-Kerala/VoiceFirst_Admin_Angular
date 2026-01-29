import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../partials/shared_services/toast.service';
import { apiConfig } from '../_config/apiConfig';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'An unexpected error occurred';
            if (error.error?.message) {
                message = error.error.message;
            }

            // 401: Unauthorized (but not during login flows, avoid duplicate feedback)
            if (error.status === 401) {
                const isLogin = req.url.includes(apiConfig.login);
                if (!isLogin) {
                    // toastService.error('Session Expired. Please login again.', 'Session Expired');
                }
            }
            // 403: Forbidden
            else if (error.status === 403) {
                toastService.error('You do not have permission to perform this action.', 'Access Denied');
            }
            // Other: Show valid error message
            else if (error.status === 409) {
                toastService.warning('Similar record already exists.', 'Duplicate Entry');
            }
            else if (error.status === 422) {

            }
            else {
                toastService.error(message, 'Error');
            }

            return throwError(() => error);
        })
    );
};
