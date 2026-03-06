import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import { IssueTypeActions } from '../../../../core/_state/issue/issue-type/issue-type.action';
import { IssueTypeModel } from '../../../../core/_state/issue/issue-type/issue-type.model';
import {
  selectAllIssueType,
  selectIssueTypeLoading,
  selectIssueTypeTotalCount,
  selectIssueTypeTotalPages
} from '../../../../core/_state/issue/issue-type/issue-type.selectors';
import { SearchBar } from '../../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { FilterBy, FilterOption } from '../../../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { IssueTypeService } from '../../../../core/_state/issue/issue-type/issue-type.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../../partials/shared_services/encryption.service';


@Component({
  selector: 'app-issue-type-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './issue-type-list.html',
  styleUrl: './issue-type-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueTypeList extends BaseListComponent implements OnInit, OnDestroy {
  issueTypes: IssueTypeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  isLocalUpdate: boolean = false;

  constructor(
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private issueTypeService: IssueTypeService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Issue Type', value: 'IssueType' },
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
    this.loading$ = this.store.select(selectIssueTypeLoading);
    this.totalCount$ = this.store.select(selectIssueTypeTotalCount);

    this.store.select(selectIssueTypeTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectIssueTypeTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllIssueType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.isLocalUpdate) return;
        this.issueTypes = data;
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

    this.store.dispatch(IssueTypeActions.load({ queryParams: params }));
  }

  onDelete(item: IssueTypeModel) {
    this.confirmationService.confirmDelete(item.issueType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueTypeService.delete(item.issueTypeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Issue Type deleted successfully', 'Success');
                const index = this.issueTypes.findIndex(x => x.issueTypeId === item.issueTypeId);
                if (index !== -1) {
                  this.issueTypes[index] = {
                    ...this.issueTypes[index],
                    ...((res as any)?.data),
                    deletedUser: (res as any)?.data?.deletedUser || (res as any)?.data?.deletedBy,
                    deletedDate: (res as any)?.data?.deletedDate || new Date().toISOString(),
                    deleted: true
                  };
                  this.issueTypes = [...this.issueTypes];
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

  onRestore(item: IssueTypeModel) {
    this.confirmationService.confirmRestore(item.issueType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueTypeService.restore(item.issueTypeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Issue Type restored successfully', 'Success');
                const index = this.issueTypes.findIndex(x => x.issueTypeId === item.issueTypeId);
                if (index !== -1) {
                  this.issueTypes[index] = {
                    ...this.issueTypes[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    deleted: false
                  };
                  this.issueTypes = [...this.issueTypes];
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

  onSuspend(item: IssueTypeModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.issueType, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const payload = { active: status };
          this.issueTypeService.update(item.issueTypeId, payload).subscribe({
            next: (res) => {
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Issue Type ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                const index = this.issueTypes.findIndex(x => x.issueTypeId === item.issueTypeId);
                if (index !== -1) {
                  this.issueTypes[index] = {
                    ...this.issueTypes[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    active: status
                  };
                  this.issueTypes = [...this.issueTypes];
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
    this.router.navigate(['/issue-type/add']);
  }

  openEditDialog(item: IssueTypeModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.issueTypeId);
    this.router.navigate(['/issue-type/edit', encryptedId]);
  }
}
