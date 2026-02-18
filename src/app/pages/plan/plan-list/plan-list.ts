import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { PlanModel } from '../../../core/_state/plan/plan.model';
import { Observable, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { PlanService } from '../../../core/_state/plan/plan.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { selectAllPlans, selectPlanLoading, selectPlanTotalCount, selectPlanTotalPages } from '../../../core/_state/plan/plan.selectors';
import { PlanActions } from '../../../core/_state/plan/plan.action';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-plan-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList extends BaseListComponent implements OnInit, OnDestroy {
  plans: PlanModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private planService: PlanService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Plan Name', value: 'PlanName' },
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
    this.loading$ = this.store.select(selectPlanLoading);
    this.totalCount$ = this.store.select(selectPlanTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectPlanTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectPlanTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllPlans)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.plans = data;
        console.log("Plans", this.plans);
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  // Load data with current query parameters
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
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Query Params Plan", params);

    this.store.dispatch(PlanActions.load({ queryParams: params }));
  }

  // Delete confirmation using shared service
  onDelete(item: PlanModel) {
    this.confirmationService.confirmDelete(item.planName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.planService.delete(item.planId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Plan deleted successfully', 'Success');
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

  onRestore(item: PlanModel) {
    this.confirmationService.confirmRestore(item.planName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.planService.restore(item.planId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Plan restored successfully', 'Success');
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

  onSuspend(item: PlanModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.planName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedPlanAction = {
            active: status,
          }
          this.planService.update(item.planId, updatedPlanAction).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success(`Plan ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                this.store.dispatch(PlanActions.update({
                  plan: {
                    id: item.planId,
                    changes: updatedPlanAction
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
    this.router.navigate(['/plan/add']);
  }

  // Open edit dialog
  navigateToEdit(item: PlanModel) {
    this.router.navigate(['/plan/edit', item.planId]);

  }

  navigateToDetails(item: PlanModel) {
    this.router.navigate(['/plan/details', item.planId]);

  }
}
