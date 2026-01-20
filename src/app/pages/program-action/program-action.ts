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

@Component({
  selector: 'app-program-action',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, MatProgressBarModule],
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
    this.store.dispatch(ProgramActionActions.load({ queryParams: this.queryParams }));
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
}

