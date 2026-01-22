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
import { ConfirmationService } from '../../partials/shared_services/confirmation';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { MaterialModule } from '../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil, Observable } from 'rxjs';
import { QueryParameterModel } from '../../core/_models/query-parameter.model';
import { BusinessActivityService } from '../../core/_state/business-activity/business-activity.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { FilterBy } from '../../partials/shared_modules/filter-by/filter-by';
import { SortableColumnDirective, SortEvent } from '../../partials/shared_directives/sortable-column';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';

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
export class BusinessActivity implements OnInit, OnDestroy {
  businessActivities: BusinessActivityModel[] = [];
  loading$!: Observable<boolean>;

  // Pagination & State
  totalCount = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  isSearching = false;

  // SearchBy dropdown options
  searchByOptions = [
    { label: 'Activity Name', value: 'ActivityName' },
    { label: 'Created By', value: 'CreatedUser' },
    { label: 'Updated By', value: 'UpdatedUser' },
    { label: 'Deleted By', value: 'DeletedUser' }
  ];

  // Query parameters
  queryParams: QueryParameterModel = {
    SearchText: ''
  };

  currentPage = 1;
  pageSize = 10;
  pageSizes = [5, 10, 20, 50];

  statusFilters: { Active?: boolean; Deleted?: boolean } = {};
  activeFilters: Record<string, string[]> = {};
  clearSignal = 0;

  filterOptions: FilterOption[] = [
    {
      label: 'Status',
      key: 'status',
      options: ['Active', 'Inactive', 'Deleted'],
      single: true
    }
  ];

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private businessActivityService: BusinessActivityService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService
  ) { }

  ngOnInit() {
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
        this.businessActivities = data;
        console.log(this.businessActivities);

        this.cdr.markForCheck();
      });

    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Business Activity Query Params", params);
    this.store.dispatch(BusinessActivityActions.load({ queryParams: params }));
  }

  // ---------- Search & Filter Logic ----------

  onSearch(searchText: string) {
    this.queryParams = {
      ...this.queryParams,
      SearchText: searchText,
      PageNumber: 1
    };
    this.currentPage = 1;
    this.isSearching = false;
    this.loadData();
  }

  onTypingChange(isTyping: boolean) {
    this.isSearching = isTyping;
    this.cdr.markForCheck();
  }

  onSearchByChange(searchBy: string) {
    this.queryParams = {
      ...this.queryParams,
      SearchBy: searchBy || undefined,
      PageNumber: 1
    };
    this.currentPage = 1;
    if (this.queryParams.SearchText) {
      this.loadData();
    }
  }

  onFilterChange(filters: Record<string, string[]>) {
    this.activeFilters = filters;

    // Reset status filters
    this.statusFilters = {};

    // Special handling for 'status' filter → maps to Active/Deleted booleans
    const status = filters['status']?.[0];
    if (status === 'Active') {
      this.statusFilters.Active = true;
      this.statusFilters.Deleted = false;
    } else if (status === 'Inactive') {
      this.statusFilters.Active = false;
      this.statusFilters.Deleted = false;
    } else if (status === 'Deleted') {
      this.statusFilters.Deleted = true;
    }

    // Generic handling: pass all other filters directly to query params
    // (except 'status' which is handled above)
    const otherFilters: Record<string, any> = {};
    Object.keys(filters).forEach(key => {
      if (key !== 'status' && filters[key]?.length > 0) {
        // For single-value filters, pass the value directly
        // For multi-value filters, pass as array or comma-separated string
        const values = filters[key];
        otherFilters[key] = values.length === 1 ? values[0] : values.join(',');
      }
    });

    // Merge all filters into query params
    this.queryParams = {
      ...this.queryParams,
      ...otherFilters,
      PageNumber: 1
    };

    // Reset to first page and reload
    this.currentPage = 1;
    this.loadData();
  }

  removeFilter(key: string, value: string) {
    if (!this.activeFilters[key]) return;

    this.activeFilters[key] = this.activeFilters[key].filter(v => v !== value);
    if (this.activeFilters[key].length === 0) delete this.activeFilters[key];

    this.onFilterChange({ ...this.activeFilters });
  }

  clearAllFilters() {
    const filterKeys = this.filterOptions.map(f => f.key);
    filterKeys.forEach(key => {
      if (key !== 'status') {
        delete (this.queryParams as any)[key];
      }
    });

    this.activeFilters = {};
    this.clearSignal++;
    this.onFilterChange({});
  }

  // ---------- Sort & Pagination ----------

  onSortChange(event: SortEvent) {
    this.queryParams = {
      ...this.queryParams,
      SortBy: event.column,
      SortOrder: event.direction
    };
    this.loadData();
  }

  onPaginationChange(event: { page: number; size: number }) {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadData();
  }

  // ---------- Actions ----------

  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditBusinessActivity, {
      width: '600px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.statusCode === 201) {
        this.store.dispatch(BusinessActivityActions.add({ activity: result.data }));
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
        this.store.dispatch(BusinessActivityActions.update({
          activity: { id: result.data.activityId, changes: result.data }
        }));
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
                this.toastService.success('Business Activity deleted successfully');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
              this.toastService.error(err.message || 'Failed to delete Business Activity');
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
                this.toastService.success('Business Activity restored successfully');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
              this.toastService.error(err.message || 'Failed to restore Business Activity');
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
              if (res.statusCode === 200) {
                const msg = active ? 'suspended' : 'reinstated';
                this.toastService.success(`Business Activity ${msg} successfully`);
                this.store.dispatch(BusinessActivityActions.update({
                  activity: { id: item.activityId, changes: { active: active } }
                }));
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
              this.toastService.error(err.message || 'Failed to update status');
            }
          });
        }
      });
  }
}
