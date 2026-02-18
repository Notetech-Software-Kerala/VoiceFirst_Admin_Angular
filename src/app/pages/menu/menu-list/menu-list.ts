import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { MasterMenuModel } from '../../../core/_state/menu/menu.model';
import { MenuActions } from '../../../core/_state/menu/menu.action';
import { Observable, takeUntil } from 'rxjs';
import { selectAllMenus, selectMenuLoading, selectMenuTotalCount, selectMenuTotalPages } from '../../../core/_state/menu/menu.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuService } from '../../../core/_state/menu/menu.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-menu-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css',
})
export class MenuList extends BaseListComponent implements OnInit, OnDestroy {
  menus: MasterMenuModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private menuService: MenuService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Menu Name', value: 'MenuName' },
      // { label: 'Route', value: 'Route' },
      // { label: 'Platform ID', value: 'PlateFormId' },
      // { label: 'Created By', value: 'CreatedUser' },
      // { label: 'Updated By', value: 'ModifiedUser' },
      // { label: 'Deleted By', value: 'DeletedUser' }
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

    super.ngOnInit();
  }

  loadData() {
    if (!this.queryParams.SortBy) {
      this.queryParams.SortBy = "createdAt";
    }
    if (!this.queryParams.SortOrder) {
      this.queryParams.SortOrder = "Desc";
    }
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Query Params", params);
    this.store.dispatch(MenuActions.load({ queryParams: params }));
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
              this.toastService.error(error.message, 'Error');
            }
          })
        }
      });
  }

  onRestore(item: MasterMenuModel) {
    this.confirmationService.confirmRestore(item.menuName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.menuService.restoreMasterMenu(item.menuId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Menu restored successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => {
            }
          })
        }
      });
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

  navigateToDetails(item: MasterMenuModel) {
    this.router.navigate(['/menu/details', item.menuId]);
  }
}
