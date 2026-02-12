import { Routes } from '@angular/router';
import { BaseLayout } from './layout/base-layout/base-layout';
import { BlankLayout } from './layout/blank-layout/blank-layout';
import { authGuard } from './core/_auth/auth.guard';


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
        // canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'menu',
                loadComponent: () => import('./pages/menu/menu').then(m => m.Menu),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/menu/menu-list/menu-list').then(m => m.MenuList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/menu/add-edit-menu/add-edit-menu').then(m => m.AddEditMenu)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/menu/add-edit-menu/add-edit-menu').then(m => m.AddEditMenu)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/menu/menu-details/menu-details').then(m => m.MenuDetails)
                    },
                    {
                        path: 'configure',
                        loadComponent: () => import('./pages/menu/configure-menu/configure-menu').then(m => m.ConfigureMenu),
                        // children: [
                        //     {
                        //         path: 'web-menu',
                        //         loadComponent: () => import('./pages/menu/configure-menu/web-menu/web-menu').then(m => m.WebMenu)
                        //     },
                        //     {
                        //         path: 'app-menu',
                        //         loadComponent: () => import('./pages/menu/configure-menu/app-menu/app-menu').then(m => m.AppMenu)
                        //     }
                        // ]
                    },
                ]
            },
            {
                path: 'business-activity',
                loadComponent: () => import('./pages/business-activity/business-activity').then(m => m.BusinessActivity)
            },
            {
                path: 'program-action',
                loadComponent: () => import('./pages/program-action/program-action').then(m => m.ProgramAction)
            },
            {
                path: 'post-office',
                loadComponent: () => import('./pages/post-office/post-office').then(m => m.PostOffice)
            },
            {
                path: 'country',
                loadComponent: () => import('./pages/country/country').then(m => m.Country)
            },
            {
                path: 'program',
                loadComponent: () => import('./pages/program/program').then(m => m.Program),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/program/program-list/program-list').then(m => m.ProgramList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/program/add-edit-program/add-edit-program').then(m => m.AddEditProgram)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/program/add-edit-program/add-edit-program').then(m => m.AddEditProgram)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/program/program-details/program-details').then(m => m.ProgramDetails)
                    }
                ]
            },
            {
                path: 'role',
                loadComponent: () => import('./pages/roles/roles').then(m => m.Roles),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/roles/role-list/role-list').then(m => m.RoleList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/roles/add-edit-role/add-edit-role').then(m => m.AddEditRole)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/roles/add-edit-role/add-edit-role').then(m => m.AddEditRole)
                    },

                ]
            },
            {
                path: 'plan',
                loadComponent: () => import('./pages/plan/plan').then(m => m.Plan),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/plan/plan-list/plan-list').then(m => m.PlanList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/plan/add-edit-plan/add-edit-plan').then(m => m.AddEditPlan)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/plan/add-edit-plan/add-edit-plan').then(m => m.AddEditPlan)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/plan/plan-details/plan-details').then(m => m.PlanDetails)
                    }
                ]
            }
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./partials/shared_modules/not-found/not-found').then(m => m.NotFound)
    }
];
