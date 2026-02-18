import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { PostOfficeModel } from '../../core/_state/post-office/post-office.model';
import { Observable, takeUntil } from 'rxjs';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { PostOfficeService } from '../../core/_state/post-office/post-office.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { selectAllPostOffices, selectPostOfficeLoading, selectPostOfficeTotalCount, selectPostOfficeTotalPages } from '../../core/_state/post-office/post-office.selectors';
import { PostOfficeActions } from '../../core/_state/post-office/post-office.action';
import { AddEditPostOffice } from './add-edit-post-office/add-edit-post-office';
import { SortableColumnDirective } from '../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../material.module';
import { StatusBadge } from "../../partials/shared_modules/status-badge/status-badge";
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { BaseListComponent } from '../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-post-office',
  imports: [MaterialModule, StatusBadge, SearchBar, FilterBy, SortableColumnDirective, Pagination],
  templateUrl: './post-office.html',
  styleUrl: './post-office.css',
})
export class PostOffice extends BaseListComponent implements OnInit, OnDestroy {
  postOffices: PostOfficeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private postOfficeService: PostOfficeService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Post Office Name', value: 'PostOfficeName' },
      { label: 'Country', value: 'CountryName' },
      { label: 'ZIP Code', value: 'ZipCode' },
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
    this.loading$ = this.store.select(selectPostOfficeLoading);
    this.totalCount$ = this.store.select(selectPostOfficeTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectPostOfficeTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectPostOfficeTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllPostOffices)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.postOffices = data;
        console.log("Post Offices", this.postOffices);
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  // Load data with current query parameters
  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Query Params PostOffice", params);

    this.store.dispatch(PostOfficeActions.load({ queryParams: params }));
  }

  // Delete confirmation using shared service
  onDelete(item: PostOfficeModel) {
    this.confirmationService.confirmDelete(item.postOfficeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.postOfficeService.delete(item.postOfficeId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Post Office deleted successfully', 'Success');
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

  onRestore(item: PostOfficeModel) {
    this.confirmationService.confirmRestore(item.postOfficeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.postOfficeService.restore(item.postOfficeId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Post Office restored successfully', 'Success');
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

  onSuspend(item: PostOfficeModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.postOfficeName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedPostOffice = {
            active: status,
          }
          this.postOfficeService.update(item.postOfficeId, updatedPostOffice).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success(`Post Office ${item.active ? 'Suspended' : 'Reinstated'} Successfully`, 'Success');
                this.store.dispatch(PostOfficeActions.update({
                  postOffice: {
                    id: item.postOfficeId,
                    changes: updatedPostOffice
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
    const dialogRef = this.dialog.open(AddEditPostOffice, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("result", result);

        if (result.statusCode === 201) {
          // Add new item
          this.store.dispatch(PostOfficeActions.add({ postOffice: result.data }));
        } else if (result.statusCode === 200) {
          // Update existing item - use correct NgRx Entity format
          this.store.dispatch(PostOfficeActions.update({
            postOffice: {
              id: result.data.postOfficeId,
              changes: result.data
            }
          }));
        }
      }
    });
  }

  // Open edit dialog
  openEditDialog(item: PostOfficeModel) {
    const dialogRef = this.dialog.open(AddEditPostOffice, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dispatch update action
        this.store.dispatch(PostOfficeActions.update({
          postOffice: {
            id: result.data.postOfficeId,
            changes: result.data
          }
        }));
      }
    });
  }
  // Sort zip codes: active first, then deleted
  sortZipCodes(zips: any[]): any[] {
    if (!zips) return [];
    // structuredClone or spread to avoid mutation if needed, though sort makes a copy usually if we do it right
    // actually array.sort mutates, so we must copy first
    return [...zips].sort((a, b) => {
      // deleted=true should be last.
      // a.deleted vs b.deleted
      const aDeleted = !!a.deleted;
      const bDeleted = !!b.deleted;
      if (aDeleted === bDeleted) return 0;
      return aDeleted ? 1 : -1;
    });
  }
}
