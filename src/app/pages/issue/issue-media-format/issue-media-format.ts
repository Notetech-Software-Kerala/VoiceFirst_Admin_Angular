import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueMediaFormatActions } from '../../../core/_state/issue/issue-media-format/issue-media-format.action';
import { IssueMediaFormatModel } from '../../../core/_state/issue/issue-media-format/issue-media-format.model';
import {
  selectAllIssueMediaFormats,
  selectIssueMediaFormatLoading,
  selectIssueMediaFormatTotalCount,
  selectIssueMediaFormatTotalPages
} from '../../../core/_state/issue/issue-media-format/issue-media-format.selectors';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { AddEditIssueMediaFormat } from './add-edit-issue-media-format/add-edit-issue-media-format';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { IssueMediaFormatService } from '../../../core/_state/issue/issue-media-format/issue-media-format.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-issue-media-format',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './issue-media-format.html',
  styleUrl: './issue-media-format.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueMediaFormatComponent extends BaseListComponent implements OnInit, OnDestroy {
  issueMediaFormats: IssueMediaFormatModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  isLocalUpdate: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private issueMediaFormatService: IssueMediaFormatService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Media Format', value: 'IssueMediaFormat' },
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
    this.loading$ = this.store.select(selectIssueMediaFormatLoading);
    this.totalCount$ = this.store.select(selectIssueMediaFormatTotalCount);

    this.store.select(selectIssueMediaFormatTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectIssueMediaFormatTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllIssueMediaFormats)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.isLocalUpdate) return;
        this.issueMediaFormats = data;
        console.log("Issue Media Formats", this.issueMediaFormats);
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

    console.log("Query Params IssueMediaFormat", params);

    this.store.dispatch(IssueMediaFormatActions.load({ queryParams: params }));
  }

  onDelete(item: IssueMediaFormatModel) {
    this.confirmationService.confirmDelete(item.issueMediaFormat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueMediaFormatService.delete(item.issueMediaFormatId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Media Format deleted successfully', 'Success');
                const index = this.issueMediaFormats.findIndex(x => x.issueMediaFormatId === item.issueMediaFormatId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.issueMediaFormats[index] = {
                    ...this.issueMediaFormats[index],
                    ...((res as any)?.data),
                    deletedUser: (res as any)?.data?.deletedUser || (res as any)?.data?.deletedBy || userName,
                    deletedDate: (res as any)?.data?.deletedDate || new Date().toISOString(),
                    deleted: true
                  };
                  this.issueMediaFormats = [...this.issueMediaFormats];
                  this.cdr.markForCheck();
                }
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  onRestore(item: IssueMediaFormatModel) {
    this.confirmationService.confirmRestore(item.issueMediaFormat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueMediaFormatService.restore(item.issueMediaFormatId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Media Format restored successfully', 'Success');
                const index = this.issueMediaFormats.findIndex(x => x.issueMediaFormatId === item.issueMediaFormatId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.issueMediaFormats[index] = {
                    ...this.issueMediaFormats[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy || userName,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    deleted: false
                  };
                  this.issueMediaFormats = [...this.issueMediaFormats];
                  this.cdr.markForCheck();
                }
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  onSuspend(item: IssueMediaFormatModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.issueMediaFormat, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedIssueMediaFormat: Partial<IssueMediaFormatModel> = {
            active: status,
          }
          this.issueMediaFormatService.update(item.issueMediaFormatId, updatedIssueMediaFormat).subscribe({
            next: (res) => {
              console.log("response", res);
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Issue Media Format ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                const index = this.issueMediaFormats.findIndex(x => x.issueMediaFormatId === item.issueMediaFormatId);
                if (index !== -1) {
                  const userName = this.utilityService.getUser()?.firstName || 'Admin';
                  this.issueMediaFormats[index] = {
                    ...this.issueMediaFormats[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy || userName,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    active: status
                  };
                  this.issueMediaFormats = [...this.issueMediaFormats];
                  this.cdr.markForCheck();
                }
              }
            },
            error: (error) => {
              console.log("error", error);
            }
          })
        }
      });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditIssueMediaFormat, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        if (result.statusCode === 201) {
          // Prepend to array exactly so it renders without reload
          this.isLocalUpdate = true;
          this.issueMediaFormats = [result.data, ...this.issueMediaFormats];
          this.totalCount++;
          this.cdr.markForCheck();
          setTimeout(() => this.isLocalUpdate = false, 100);
        } else if (result.statusCode === 200) {
          // Replace specific index so it renders without reload
          const index = this.issueMediaFormats.findIndex(x => x.issueMediaFormatId === result.data.issueMediaFormatId);
          if (index !== -1) {
            this.issueMediaFormats[index] = { ...this.issueMediaFormats[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  openEditDialog(item: IssueMediaFormatModel) {
    const dialogRef = this.dialog.open(AddEditIssueMediaFormat, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        // Replace specific index so it renders without reload
        const index = this.issueMediaFormats.findIndex(x => x.issueMediaFormatId === result.data.issueMediaFormatId);
        if (index !== -1) {
          this.issueMediaFormats[index] = { ...this.issueMediaFormats[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }
}
