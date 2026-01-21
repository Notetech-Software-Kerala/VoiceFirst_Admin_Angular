import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ProgramActionActions } from '../../core/_state/program-action/program-action.action';
import { ProgramActionModel } from '../../core/_state/program-action/program-action.model';
import {
  selectAllProgramActions,
  selectProgramActionLoading,
  selectProgramActionTotalCount,
  selectProgramActionPageNumber,
  selectProgramActionPageSize,
  selectProgramActionTotalPages
} from '../../core/_state/program-action/program-action.selectors';
import { ConfirmDialog } from '../../partials/shared_modules/confirm-dialog/confirm-dialog';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective, SortEvent } from '../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil, Observable, of } from 'rxjs';
import { QueryParameterModel } from '../../core/_models/query-parameter.model';
import { ConfirmationService } from '../../partials/shared_services/confirmation';
import { AddEditProgramActionComponent } from './add-edit-program-action/add-edit-program-action.component';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { ProgramActionService } from '../../core/_state/program-action/program-action.service';
import { ToastService } from '../../partials/shared_services/toast.service';

@Component({
  selector: 'app-program-action',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, MatProgressBarModule, FilterBy],
  templateUrl: './program-action.html',
  styleUrl: './program-action.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramAction implements OnInit, OnDestroy {
  programActions: ProgramActionModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  private destroy$ = new Subject<void>();
  isSearching = false; // Track search debounce period

  // SearchBy dropdown options
  searchByOptions = [
    { label: 'Action Name', value: 'ActionName' },
    { label: 'Created By', value: 'CreatedUser' },
    { label: 'Updated By', value: 'UpdatedUser' },
    { label: 'Deleted By', value: 'DeletedUser' }
  ];

  // Query parameters - start with empty, backend will use defaults
  queryParams: QueryParameterModel = {
    SearchText: '' // Initialize to empty string to avoid 'undefined' in input
  };

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
    private programActionService: ProgramActionService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.loading$ = this.store.select(selectProgramActionLoading);
    this.totalCount$ = this.store.select(selectProgramActionTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectProgramActionTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectProgramActionTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllProgramActions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.programActions = data;
        console.log("Program Actions", this.programActions);

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

    this.store.dispatch(ProgramActionActions.load({ queryParams: params }));
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
  onDelete(item: ProgramActionModel) {
    this.confirmationService.confirmDelete(item.actionName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programActionService.delete(item.actionId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action deleted successfully');
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

  onRestore(item: ProgramActionModel) {
    this.confirmationService.confirmRestore(item.actionName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programActionService.restore(item.actionId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action deleted successfully');
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

  onSuspend(item: ProgramActionModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.actionName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedProgramAction = {
            active: status,
          }
          this.programActionService.update(item.actionId, updatedProgramAction).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action updated successfully');
                this.store.dispatch(ProgramActionActions.update({
                  activity: {
                    id: item.actionId,
                    changes: updatedProgramAction
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
  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditProgramActionComponent, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.statusCode === 201) {
          // Add new item
          this.store.dispatch(ProgramActionActions.add({ activity: result.data }));
        } else if (result.statusCode === 200) {
          // Update existing item - use correct NgRx Entity format
          this.store.dispatch(ProgramActionActions.update({
            activity: {
              id: result.data.actionId,
              changes: result.data
            }
          }));
        }
      }
    });
  }

  // Open edit dialog
  openEditDialog(item: ProgramActionModel) {
    const dialogRef = this.dialog.open(AddEditProgramActionComponent, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dispatch update action
        this.store.dispatch(ProgramActionActions.update({
          activity: {
            id: result.data.actionId,
            changes: result.data
          }
        }));
      }
    });
  }
}

