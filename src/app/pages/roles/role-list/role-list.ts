import { ChangeDetectorRef, Component } from '@angular/core';
import { RoleModel } from '../../../core/_state/role/role.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { RoleService } from '../../../core/_state/role/role.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { selectAllRoles, selectRoleLoading, selectRoleTotalCount, selectRoleTotalPages } from '../../../core/_state/role/role.selectors';
import { RoleActions } from '../../../core/_state/role/role.action';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy } from '../../../partials/shared_modules/filter-by/filter-by';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { BaseListComponent } from '../../../core/base/base-list.component';

@Component({
  selector: 'app-role-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './role-list.html',
  styleUrl: './role-list.css',
})
export class RoleList extends BaseListComponent {
  roles: RoleModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private roleService: RoleService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    // Set specific options for this component
    this.searchByOptions = [
      { label: 'Role Name', value: 'RoleName' }
    ];

    this.filterOptions = [
      {
        label: 'Status',
        key: 'status',
        options: ['Active', 'Inactive', 'Deleted'],
        single: true
      }
    ];
  }

  override ngOnInit() {
    this.loading$ = this.store.select(selectRoleLoading);
    this.totalCount$ = this.store.select(selectRoleTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectRoleTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectRoleTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllRoles)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.roles = data;
        console.log("Roles", this.roles);

        this.cdr.markForCheck();
      });

    // Delegate init to base (handles routing, query params setup)
    super.ngOnInit();
  }

  // Load data with current query parameters (Base calls this)
  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);

    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters
    };

    console.log("Query Params 11", params);

    this.store.dispatch(RoleActions.load({ queryParams: params }));
  }

  // Delete confirmation using shared service
  onDelete(item: RoleModel) {
    this.confirmationService.confirmDelete(item.roleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.roleService.delete(item.roleId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Role deleted successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  onRestore(item: RoleModel) {
    this.confirmationService.confirmRestore(item.roleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.roleService.restore(item.roleId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Role restored successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  onSuspend(item: RoleModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.roleName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedRoleAction = {
            active: status,
          }
          this.roleService.update(item.roleId, updatedRoleAction).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success(`Role ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                this.store.dispatch(RoleActions.update({
                  role: {
                    id: item.roleId,
                    changes: updatedRoleAction
                  }
                }));
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  // Open add dialog
  navigateToAdd() {
    this.router.navigate(['/role/add']);
  }

  // Open edit dialog
  navigateToEdit(item: RoleModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.roleId);
    this.router.navigate(['/role/edit', encryptedId]);
  }

  navigateToDetails(item: RoleModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.roleId);
    this.router.navigate(['/role/details', encryptedId]);
  }
}
