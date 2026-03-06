import { Routes } from '@angular/router';
import { BaseLayout } from './layout/base-layout/base-layout';
import { BlankLayout } from './layout/blank-layout/blank-layout';
import { authGuard } from './core/_auth/auth.guard';
import { guestGuard } from './core/_auth/guest.guard';


export const routes: Routes = [
    {
        path: '',
        component: BlankLayout,
        canActivate: [guestGuard],
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
        canActivate: [authGuard],
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
                path: 'issue-character-type',
                loadComponent: () => import('./pages/issue/issue-character-type/issue-character-type').then(m => m.IssueCharacterTypeComponent)
            },
            {
                path: 'issue-media-type',
                loadComponent: () => import('./pages/issue/issue-media-type/issue-media-type').then(m => m.IssueMediaTypeComponent)
            },
            {
                path: 'issue-media-format',
                loadComponent: () => import('./pages/issue/issue-media-format/issue-media-format').then(m => m.IssueMediaFormatComponent)
            },
            {
                path: 'issue-status',
                loadComponent: () => import('./pages/issue/issue-status/issue-status').then(m => m.IssueStatusComponent)
            },
            {
                path: 'issue-type',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/issue/issue-type/issue-type-list/issue-type-list').then(m => m.IssueTypeList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/issue/issue-type/add-edit-issue-type/add-edit-issue-type').then(m => m.AddEditIssueType)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/issue/issue-type/add-edit-issue-type/add-edit-issue-type').then(m => m.AddEditIssueType)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/issue/issue-type/issue-type-details/issue-type-details').then(m => m.IssueTypeDetails)
                    }
                ]
            },
            {
                path: 'post-office',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/post-office/post-office-list/post-office-list').then(m => m.PostOfficeList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/post-office/add-edit-post-office/add-edit-post-office').then(m => m.AddEditPostOffice)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/post-office/add-edit-post-office/add-edit-post-office').then(m => m.AddEditPostOffice)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/post-office/post-office-details/post-office-details').then(m => m.PostOfficeDetails)
                    }
                ]
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
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/roles/role-details/role-details').then(m => m.RoleDetails)
                    }

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
            },
            {
                path: 'place',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/place/place-list/place-list').then(m => m.PlaceList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/place/add-edit-place/add-edit-place').then(m => m.AddEditPlace)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/place/add-edit-place/add-edit-place').then(m => m.AddEditPlace)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/place/place-details/place-details').then(m => m.PlaceDetails)
                    }
                ]
            },
            {
                path: 'employees',

                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/employees/employees-list/employees-list').then(m => m.EmployeesList)
                    },
                    {
                        path: 'add',
                        loadComponent: () => import('./pages/employees/add-edit-employee/add-edit-employee').then(m => m.AddEditEmployee)
                    },
                    {
                        path: 'edit/:id',
                        loadComponent: () => import('./pages/employees/add-edit-employee/add-edit-employee').then(m => m.AddEditEmployee)
                    },
                    {
                        path: 'details/:id',
                        loadComponent: () => import('./pages/employees/employee-details/employee-details').then(m => m.EmployeeDetails)
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
