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
                if (isLogin) {
                    toastService.error(message, 'Login Failed');
                }
            }
            // 403: Forbidden
            else if (error.status === 403) {
                toastService.error('You do not have permission to perform this action.', 'Access Denied');
            }
            // 409: Conflict
            else if (error.status === 409) {
                toastService.warning(error.error.message);
            }
            // 422: Unprocessable Entity
            else if (error.status === 422) {
                // You can handle this case here, if necessary
                toastService.error('Validation failed. Please check the inputs.', 'Validation Error');
            }
            // Other errors
            else {
                toastService.error(message, 'Error');
            }

            return throwError(() => error);
        })
    );
};