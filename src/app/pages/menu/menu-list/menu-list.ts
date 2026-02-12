import { ChangeDetectorRef, Component } from '@angular/core';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective, SortEvent } from '../../../partials/shared_directives/sortable-column';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { MasterMenuModel } from '../../../core/_state/menu/menu.model';
import { MenuActions } from '../../../core/_state/menu/menu.action';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectAllMenus, selectMenuLoading, selectMenuTotalCount, selectMenuTotalPages } from '../../../core/_state/menu/menu.selectors';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { QueryParameterModel } from '../../../core/_models/query-parameter.model';
import { MenuService } from '../../../core/_state/menu/menu.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';

@Component({
  selector: 'app-menu-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css',
})
export class MenuList {
  menus: MasterMenuModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  private destroy$ = new Subject<void>();
  isSearching = false;

  // SearchBy dropdown options
  searchByOptions = [
    { label: 'Menu Name', value: 'MenuName' },
    { label: 'Route', value: 'Route' },
    { label: 'Platform ID', value: 'PlateFormId' },
    { label: 'Created By', value: 'CreatedUser' },
    { label: 'Updated By', value: 'ModifiedUser' },
    { label: 'Deleted By', value: 'DeletedUser' }
  ];

  // Query parameters
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
    private store: Store,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private menuService: MenuService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading$ = this.store.select(selectMenuLoading);
    this.totalCount$ = this.store.select(selectMenuTotalCount);

    this.store.select(selectMenuTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectMenuTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllMenus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.menus = data;
        console.log(this.menus);

        this.cdr.markForCheck();
      });

    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    const params = {
      ...this.queryParams,
      ...this.statusFilters
    };

    console.log("Query Params", params);
    this.store.dispatch(MenuActions.load({ queryParams: params }));
  }

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
    this.queryParams = {
      ...this.queryParams,
      PageNumber: event.page,
      Limit: event.size
    };
    this.loadData();
  }

  onFilterChange(filters: Record<string, string[]>) {
    this.activeFilters = filters;
    this.statusFilters = {};

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

    const otherFilters: Record<string, any> = {};
    Object.keys(filters).forEach(key => {
      if (key !== 'status' && filters[key]?.length > 0) {
        const values = filters[key];
        otherFilters[key] = values.length === 1 ? values[0] : values.join(',');
      }
    });

    this.queryParams = {
      ...this.queryParams,
      ...otherFilters,
      PageNumber: 1
    };

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

  onDelete(item: MasterMenuModel) {
    this.confirmationService.confirmDelete(item.menuName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.menuService.delete(item.menuId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Menu deleted successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => {
              this.toastService.error(error.message);
            }
          })
        }
      });
  }

  onRestore(item: MasterMenuModel) {
    // this.confirmationService.confirmRestore(item.menuName)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(confirmed => {
    //     if (confirmed) {
    //       this.menuService.restore(item.menuId).subscribe({
    //         next: (res) => {
    //           if (res.statusCode === 200) {
    //             this.toastService.success('Menu restored successfully', 'Success');
    //             this.loadData();
    //           }
    //         },
    //         error: (error) => {
    //           this.toastService.error(error.message);
    //         }
    //       })
    //     }
    //   });
  }

  onSuspend(item: MasterMenuModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.menuName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedMenu = {
            active: status,
          };
          this.menuService.updateMasterMenu(item.menuId, updatedMenu).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Menu ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                // Optimistically update or reload
                this.store.dispatch(MenuActions.update({
                  menu: {
                    id: item.menuId,
                    changes: updatedMenu
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

  navigateToConfigure() {
    this.router.navigate(['/menu/configure']);
  }

  navigateToAdd() {
    this.router.navigate(['/menu/add']);
  }

  navigateToEdit(item: MasterMenuModel) {
    this.router.navigate(['/menu/edit', item.menuId]);
  }
}
