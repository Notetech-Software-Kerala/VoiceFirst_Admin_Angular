import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BusinessActivityActions } from '../../core/_state/business-activity/business-activity.actions';
import { BusinessActivityModel } from '../../core/_state/business-activity/business-activity.model';
import { selectAllBusinessActivities, selectBusinessActivityLoading } from '../../core/_state/business-activity/business-activity.selectors';
import { AddEditBusinessActivity } from './add-edit-business-activity/add-edit-business-activity';
import { ConfirmDialog } from '../../partials/shared_modules/confirm-dialog/confirm-dialog';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { MaterialModule } from '../../material.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil, Observable } from 'rxjs';

@Component({
  selector: 'app-business-activity',
  imports: [SearchBar, Pagination, MaterialModule, MatProgressBarModule],
  templateUrl: './business-activity.html',
  styleUrl: './business-activity.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessActivity implements OnInit, OnDestroy {
  businessActivities: BusinessActivityModel[] = [];
  filteredBuisnessActivity: BusinessActivityModel[] = [];
  paginatedBuisnessActivity: BusinessActivityModel[] = [];
  loading$!: Observable<boolean>;
  private destroy$ = new Subject<void>();

  // search/sort state
  searchText = '';
  sortColumn: keyof BusinessActivityModel = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // pagination state (child emits, parent slices)
  pageSize = 10;
  currentPage = 1;
  pageSizes = [5, 10, 20];

  // filters
  activeFilters: Record<string, string[]> = {};
  clearSignal = 0;

  filterOptions: FilterOption[] = [
    { label: 'City', key: 'city', options: ['New York', 'London', 'Delhi', 'Tokyo'] },
    { label: 'Role', key: 'role', options: ['Admin', 'User', 'Manager'] },
  ];

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading$ = this.store.select(selectBusinessActivityLoading);
    this.store.dispatch(BusinessActivityActions.load());

    this.store.select(selectAllBusinessActivities)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.businessActivities = data;
        this.applyFilter();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------- Child → Parent glue ----------

  onFilterChange(filters: Record<string, string[]>) {
    this.activeFilters = filters;
    this.currentPage = 1;
    this.applyFilter();
  }

  changePage(page: number) {
    const total = this.totalPageCount();
    this.currentPage = Math.min(Math.max(1, page), total || 1);
    this.paginate();
  }

  changePageSize(size: number | string) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.paginate();
  }

  // ---------- Filtering / sorting / slicing ----------

  applyFilter() {
    const val = this.searchText.toLowerCase().trim();

    this.filteredBuisnessActivity = this.businessActivities.filter(u => {
      const matchesText =
        !val ||
        u.name.toLowerCase().includes(val);

      const matchesFilters = Object.entries(this.activeFilters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const fieldVal = (u as any)[key];
        return values.includes(fieldVal);
      });

      return matchesText && matchesFilters;
    });

    this.sortData(); // also paginates
  }

  sortData(column?: keyof BusinessActivityModel) {
    if (column) {
      this.sortDirection =
        this.sortColumn === column && this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortColumn = column;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredBuisnessActivity.sort((a, b) =>
      a[this.sortColumn] < b[this.sortColumn] ? -1 * dir :
        a[this.sortColumn] > b[this.sortColumn] ? 1 * dir : 0
    );

    this.currentPage = 1; // reset to first page after sort
    this.paginate();
  }

  paginate() {
    const totalPages = this.totalPageCount();
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedBuisnessActivity = this.filteredBuisnessActivity.slice(start, start + this.pageSize);
  }

  totalPageCount(): number {
    return Math.max(1, Math.ceil(this.filteredBuisnessActivity.length / this.pageSize));
  }

  // ---------- Active filter chips (owned by table template) ----------

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

  // ---------- Add / Edit dialog ----------

  openDialog(businessActivity?: BusinessActivityModel) {
    const dialogRef = this.dialog.open(AddEditBusinessActivity, {
      width: '600px',
      data: businessActivity ? { ...businessActivity } : null,
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle result if needed
    });
  }



  // ---------- Delete confirmation dialog ----------

  onDelete(u: BusinessActivityModel) {
    const ref = this.dialog.open(ConfirmDialog, {
      panelClass: 'modern-confirm-panel',
      autoFocus: false,           // keep focus on buttons
      data: {
        icon: 'delete',
        tone: 'warn',             // 'warn' | 'accent' | 'neutral'
        title: 'Delete item',
        message: `Are you sure you want to delete “${u.name}”?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        // perform delete...
      }
    });
  }
}
