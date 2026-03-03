import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { EmployeeModel } from '../../../core/_state/employee/employee.model';
import { Observable, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { EmployeeService } from '../../../core/_state/employee/employee.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { selectAllEmployees, selectEmployeeLoading, selectEmployeeTotalCount, selectEmployeeTotalPages } from '../../../core/_state/employee/employee.selectors';
import { EmployeeActions } from '../../../core/_state/employee/employee.action';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';

@Component({
  selector: 'app-employees-list',
  imports: [
    CommonModule,
    SearchBar,
    Pagination,
    MaterialModule,
    MatProgressBarModule,
    FilterBy,
    SortableColumnDirective,
    StatusBadge
  ],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.css',
})
export class EmployeesList extends BaseListComponent implements OnInit, OnDestroy {
  employees: EmployeeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService,
    protected override router: Router
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'First Name', value: 'FirstName' },
      { label: 'Last Name', value: 'LastName' },
      { label: 'Email', value: 'Email' }
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
    this.loading$ = this.store.select(selectEmployeeLoading);
    this.totalCount$ = this.store.select(selectEmployeeTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectEmployeeTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectEmployeeTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    // Subscribe to data
    this.store.select(selectAllEmployees)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log("data", data);
        this.employees = data;
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
    };

    this.store.dispatch(EmployeeActions.load({ queryParams: params }));
  }

  onDelete(item: EmployeeModel) {
    this.confirmationService.confirmDelete(`${item.firstName} ${item.lastName}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.employeeService.delete(item.employeeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Employee deleted successfully', 'Success');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      });
  }

  onRestore(item: EmployeeModel) {
    this.confirmationService.confirmRestore(`${item.firstName} ${item.lastName}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.employeeService.restore(item.employeeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Employee restored successfully', 'Success');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      });
  }

  onSuspend(item: EmployeeModel) {
    const active = item.active ? false : true;
    this.confirmationService.confirmSuspend(`${item.firstName} ${item.lastName}`, active)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const payload = {
            active: active
          }

          this.employeeService.update(item.employeeId, payload).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                const msg = active ? 'Suspended' : 'Reinstated';
                this.toastService.success(`Employee ${msg} successfully`, 'Success');
                this.store.dispatch(EmployeeActions.update({
                  employee: { id: item.employeeId, changes: { active: active } }
                }));
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);

            }
          });
        }
      });
  }

  navigateToAdd() {
    this.router.navigate(['/employees/add']);
  }

  navigateToEdit(item: EmployeeModel) {
    this.router.navigate(['/employees/edit', this.encryptionService.encryptForRoute(item.employeeId)]);
  }

  navigateToDetails(item: EmployeeModel) {
    this.router.navigate(['/employees/details', this.encryptionService.encryptForRoute(item.employeeId)]);
  }
}
