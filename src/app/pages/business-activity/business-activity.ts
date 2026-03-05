import { Component, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BusinessActivityActions } from '../../core/_state/business-activity/business-activity.actions';
import { BusinessActivityModel } from '../../core/_state/business-activity/business-activity.model';
import {
  selectAllBusinessActivities,
  selectBusinessActivityLoading,
  selectBusinessActivityTotalCount,
  selectBusinessActivityTotalPages
} from '../../core/_state/business-activity/business-activity.selectors';
import { AddEditBusinessActivity } from './add-edit-business-activity/add-edit-business-activity';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { MaterialModule } from '../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil, Observable } from 'rxjs';
import { BusinessActivityService } from '../../core/_state/business-activity/business-activity.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { FilterBy } from '../../partials/shared_modules/filter-by/filter-by';
import { SortableColumnDirective, SortEvent } from '../../partials/shared_directives/sortable-column';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../partials/shared_services/encryption.service';
import { BaseListComponent } from '../../core/base/base-list.component';

@Component({
  selector: 'app-business-activity',
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
  templateUrl: './business-activity.html',
  styleUrl: './business-activity.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessActivity extends BaseListComponent implements OnInit, OnDestroy {
  businessActivities: BusinessActivityModel[] = [];
  loading$!: Observable<boolean>;
  isLocalUpdate: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private businessActivityService: BusinessActivityService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService,
    protected override router: Router
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Activity Name', value: 'ActivityName' },
      { label: 'Created By', value: 'CreatedUser' },
      { label: 'Updated By', value: 'UpdatedUser' },
      { label: 'Deleted By', value: 'DeletedUser' }
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
    this.loading$ = this.store.select(selectBusinessActivityLoading);

    // Subscribe to pagination metadata
    this.store.select(selectBusinessActivityTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectBusinessActivityTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    // Subscribe to data
    this.store.select(selectAllBusinessActivities)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.isLocalUpdate) return;
        this.businessActivities = data;
        console.log(this.businessActivities);

        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  loadData() {
    if (!this.queryParams.SortBy) {
      this.queryParams.SortBy = "createdAt";
    }
    if (!this.queryParams.SortOrder) {
      this.queryParams.SortOrder = "Desc";
    }
    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize, // Using this.pageSize from base
      PageNumber: this.currentPage // Using this.currentPage from base
    };

    console.log("Business Activity Query Params", params);
    this.store.dispatch(BusinessActivityActions.load({ queryParams: params }));
  }

  // ---------- Actions ----------

  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditBusinessActivity, {
      width: '600px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("Add Result", result);

      if (result) {
        if (result.statusCode === 201) {
          this.isLocalUpdate = true;
          this.businessActivities = [result.data, ...this.businessActivities];
          this.totalCount++;
          this.cdr.markForCheck();
          setTimeout(() => this.isLocalUpdate = false, 100);
        } else if (result.statusCode === 200) {
          const index = this.businessActivities.findIndex(x => x.activityId === result.data.activityId);
          if (index !== -1) {
            this.businessActivities[index] = { ...this.businessActivities[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  openEditDialog(item: BusinessActivityModel) {
    const dialogRef = this.dialog.open(AddEditBusinessActivity, {
      width: '600px',
      disableClose: true,
      data: { ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.statusCode === 200) {
        const index = this.businessActivities.findIndex(x => x.activityId === result.data.activityId);
        if (index !== -1) {
          this.businessActivities[index] = { ...this.businessActivities[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }

  onDelete(item: BusinessActivityModel) {
    this.confirmationService.confirmDelete(item.activityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.businessActivityService.delete(item.activityId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Business Activity deleted successfully', 'Success');
                const index = this.businessActivities.findIndex(x => x.activityId === item.activityId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.businessActivities[index] = {
                    ...this.businessActivities[index],
                    ...((res as any)?.data),
                    deletedUser: (res as any)?.data?.deletedUser || (res as any)?.data?.deletedBy || userName,
                    deletedDate: (res as any)?.data?.deletedDate || new Date().toISOString(),
                    deleted: true
                  };
                  this.businessActivities = [...this.businessActivities];
                  this.cdr.markForCheck();
                }
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

  onRestore(item: BusinessActivityModel) {
    this.confirmationService.confirmRestore(item.activityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.businessActivityService.restore(item.activityId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Business Activity restored successfully', 'Success');
                const index = this.businessActivities.findIndex(x => x.activityId === item.activityId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.businessActivities[index] = {
                    ...this.businessActivities[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy || userName,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    deleted: false
                  };
                  this.businessActivities = [...this.businessActivities];
                  this.cdr.markForCheck();
                }
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

  onSuspend(item: BusinessActivityModel) {
    const active = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.activityName, active)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const payload = {
            active: active
          }

          this.businessActivityService.update(item.activityId, payload).subscribe({
            next: (res) => {
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                const msg = active ? 'Reinstated' : 'Suspended';
                this.toastService.success(`Business Activity ${msg} successfully`, 'Success');
                const index = this.businessActivities.findIndex(x => x.activityId === item.activityId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.businessActivities[index] = {
                    ...this.businessActivities[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy || userName,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    active: active
                  };
                  this.businessActivities = [...this.businessActivities];
                  this.cdr.markForCheck();
                }
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
}
