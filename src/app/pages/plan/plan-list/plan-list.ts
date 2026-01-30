import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective, SortEvent } from '../../../partials/shared_directives/sortable-column';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { PlanModel } from '../../../core/_state/plan/plan.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { QueryParameterModel } from '../../../core/_models/query-parameter.model';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { PlanService } from '../../../core/_state/plan/plan.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { selectRoleLoading } from '../../../core/_state/role/role.selectors';
import { Router } from '@angular/router';
import { selectAllPlans, selectPlanLoading, selectPlanTotalCount, selectPlanTotalPages } from '../../../core/_state/plan/plan.selectors';
import { PlanActions } from '../../../core/_state/plan/plan.action';

@Component({
  selector: 'app-plan-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList {
  plans: PlanModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  private destroy$ = new Subject<void>();
  isSearching = false; // Track search debounce period

  // SearchBy dropdown options
  searchByOptions = [
    { label: 'Plan Name', value: 'PlanName' },
    { label: 'Created By', value: 'CreatedUser' },
    { label: 'Updated By', value: 'UpdatedUser' },
    { label: 'Deleted By', value: 'DeletedUser' }
  ];

  // Query parameters - start with empty, backend will use defaults
  queryParams: QueryParameterModel = {};

  // Pagination state
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];


  statusFilters: { Active?: boolean; Deleted?: boolean } = {};

  filterOptions: FilterOption[] = [
    {
      label: 'Status',
      key: 'status',
      options: ['Active', 'Inactive', 'Deleted'],
      single: true
    }
  ];

  activeFilters: Record<string, string[]> = {};
  clearSignal = 0;
  constructor(
    private dialog: MatDialog,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private planService: PlanService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
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

    // Initial load
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load data with current query parameters
  loadData() {
    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters
    };

    console.log("Query Params 11", params);

    this.store.dispatch(PlanActions.load({ queryParams: params }));
  }

  // Search handler - receives debounced value from search-bar
  onSearch(searchText: string) {
    this.queryParams = {
      ...this.queryParams,
      SearchText: searchText,
      PageNumber: 1
    };
    this.currentPage = 1;
    this.isSearching = false; // Search completed
    this.loadData();
  }

  // Typing handler - receives immediate typing state from search-bar
  onTypingChange(isTyping: boolean) {
    this.isSearching = isTyping;
    this.cdr.markForCheck();
  }

  // SearchBy handler - receives selected field from dropdown
  onSearchByChange(searchBy: string) {
    this.queryParams = {
      ...this.queryParams,
      SearchBy: searchBy || undefined, // Remove if empty
      PageNumber: 1
    };
    this.currentPage = 1;
    if (this.queryParams.SearchText) {
      this.loadData(); // Only reload if there's search text
    }
  }

  // Sort handler - receives sort event from directive
  onSortChange(event: SortEvent) {
    this.queryParams = {
      ...this.queryParams,
      SortBy: event.column,
      SortOrder: event.direction
    };
    this.loadData();
  }

  // Combined pagination handler - receives both page and size
  onPaginationChange(event: { page: number; size: number }) {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.queryParams = {
      ...this.queryParams,
      PageNumber: event.page,
      Limit: event.size
    };
    this.loadData();
  }

  // Filter handler - composable method that handles all filters
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
    // Get all filter keys to remove them from queryParams
    const filterKeys = this.filterOptions.map(f => f.key);
    // Remove all filter-related params from queryParams
    filterKeys.forEach(key => {
      if (key !== 'status') {
        delete (this.queryParams as any)[key];
      }
    });

    this.activeFilters = {};
    this.clearSignal++;
    this.onFilterChange({});
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
              this.toastService.error(error.message);
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
              this.toastService.error(error.message);
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
}
