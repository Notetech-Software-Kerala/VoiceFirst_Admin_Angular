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
import { Subject, takeUntil, Observable } from 'rxjs';
import { QueryParameterModel } from '../../core/_models/query-parameter.model';
import { ConfirmationService } from '../../partials/shared_services/confirmation';
import { AddEditProgramActionComponent } from './add-edit-program-action/add-edit-program-action.component';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';

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
      single: true // ✅ only one check allowed
    },
    { label: 'Role', key: 'role', options: ['Admin', 'User', 'Manager'] },
  ];
  activeFilters: Record<string, string[]> = {};
  clearSignal = 0;
  constructor(
    private dialog: MatDialog,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
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
    this.loadData();
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

  // Filter handler - directly maps filter selections to Active/Delete parameters
  onFilterChange(filters: Record<string, string[]>) {
    this.activeFilters = filters;

    const status = filters['status']?.[0]; // single select

    // Reset status filters
    this.statusFilters = {};

    if (status === 'Active') {
      this.statusFilters.Active = true;
      this.statusFilters.Deleted = false;
    } else if (status === 'Inactive') {
      this.statusFilters.Active = false;
      this.statusFilters.Deleted = false;
    } else if (status === 'Deleted') {
      this.statusFilters.Deleted = true;
      // Active is not set for deleted items
    }

    // Reset to first page and reload
    this.queryParams.PageNumber = 1;
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
          this.store.dispatch(ProgramActionActions.delete({ id: item.actionId }));
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
        // Dispatch add action
        this.store.dispatch(ProgramActionActions.add({ activity: result }));
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
            id: result.actionId,
            changes: result
          }
        }));
      }
    });
  }
}

