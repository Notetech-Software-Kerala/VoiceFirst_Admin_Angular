import { Routes } from '@angular/router';
import { BaseLayout } from './layout/base-layout/base-layout';
import { BlankLayout } from './layout/blank-layout/blank-layout';

export const routes: Routes = [
    {
        path: '',
        component: BlankLayout,
        children: [
            {
                path: '', redirectTo: 'login', pathMatch: 'full'
            },
            {
                path: 'login',
                loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('./pages/auth/forgot-paassword/forgot-paassword').then(m => m.ForgotPaassword)
            }
        ]
    },
    {
        path: '',
        component: BaseLayout,
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'business-activity',
                loadComponent: () => import('./pages/business-activity/business-activity').then(m => m.BusinessActivity)
            }
        ]
    }
];
