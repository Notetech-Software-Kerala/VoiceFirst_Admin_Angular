import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueStatusActions } from '../../../core/_state/issue/issue-status/issue-status.action';
import { IssueStatusModel } from '../../../core/_state/issue/issue-status/issue-status.model';
import {
  selectAllIssueStatus,
  selectIssueStatusLoading,
  selectIssueStatusTotalCount,
  selectIssueStatusTotalPages
} from '../../../core/_state/issue/issue-status/issue-status.selectors';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { AddEditIssueStatus } from './add-edit-issue-status/add-edit-issue-status';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { IssueStatusService } from '../../../core/_state/issue/issue-status/issue-status.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-issue-status',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './issue-status.html',
  styleUrl: './issue-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueStatusComponent extends BaseListComponent implements OnInit, OnDestroy {
  issueStatuses: IssueStatusModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private issueStatusService: IssueStatusService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Issue Status', value: 'IssueStatus' },
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
    this.loading$ = this.store.select(selectIssueStatusLoading);
    this.totalCount$ = this.store.select(selectIssueStatusTotalCount);

    this.store.select(selectIssueStatusTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectIssueStatusTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllIssueStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.issueStatuses = data;
        console.log("Issue Status", this.issueStatuses);
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

    console.log("Query Params IssueStatus", params);

    this.store.dispatch(IssueStatusActions.load({ queryParams: params }));
  }

  onDelete(item: IssueStatusModel) {
    this.confirmationService.confirmDelete(item.issueStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueStatusService.delete(item.issueStatusId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Status deleted successfully', 'Success');
                const index = this.issueStatuses.findIndex(x => x.issueStatusId === item.issueStatusId);
                if (index !== -1) {
                  this.issueStatuses[index] = { ...this.issueStatuses[index], deleted: true };
                  this.issueStatuses = [...this.issueStatuses];
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

  onRestore(item: IssueStatusModel) {
    this.confirmationService.confirmRestore(item.issueStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueStatusService.restore(item.issueStatusId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Status restored successfully', 'Success');
                const index = this.issueStatuses.findIndex(x => x.issueStatusId === item.issueStatusId);
                if (index !== -1) {
                  this.issueStatuses[index] = { ...this.issueStatuses[index], deleted: false };
                  this.issueStatuses = [...this.issueStatuses];
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

  onSuspend(item: IssueStatusModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.issueStatus, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedIssueStatus = {
            active: status,
          }
          this.issueStatusService.update(item.issueStatusId, updatedIssueStatus).subscribe({
            next: (res) => {
              console.log("response", res);
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Issue Status ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                const index = this.issueStatuses.findIndex(x => x.issueStatusId === item.issueStatusId);
                if (index !== -1) {
                  this.issueStatuses[index] = { ...this.issueStatuses[index], active: status };
                  this.issueStatuses = [...this.issueStatuses];
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
    const dialogRef = this.dialog.open(AddEditIssueStatus, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        if (result.statusCode === 201) {
          // Prepend to array exactly so it renders without reload
          this.issueStatuses = [result.data, ...this.issueStatuses];
          this.totalCount++;
          this.cdr.markForCheck();
        } else if (result.statusCode === 200) {
          // Replace specific index so it renders without reload
          const index = this.issueStatuses.findIndex(x => x.issueStatusId === result.data.issueStatusId);
          if (index !== -1) {
            this.issueStatuses[index] = { ...this.issueStatuses[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  openEditDialog(item: IssueStatusModel) {
    const dialogRef = this.dialog.open(AddEditIssueStatus, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        // Replace specific index so it renders without reload
        const index = this.issueStatuses.findIndex(x => x.issueStatusId === result.data.issueStatusId);
        if (index !== -1) {
          this.issueStatuses[index] = { ...this.issueStatuses[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }
}
