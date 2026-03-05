import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueCharacterTypeActions } from '../../../core/_state/issue/issue-character-type/issue-character-type.action';
import { IssueCharacterTypeModel } from '../../../core/_state/issue/issue-character-type/issue-character-type.model';
import {
  selectAllIssueCharacterTypes,
  selectIssueCharacterTypeLoading,
  selectIssueCharacterTypeTotalCount,
  selectIssueCharacterTypeTotalPages
} from '../../../core/_state/issue/issue-character-type/issue-character-type.selectors';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { AddEditIssueCharacterTypeComponent } from './add-edit-issue-character-type/add-edit-issue-character-type';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { IssueCharacterTypeService } from '../../../core/_state/issue/issue-character-type/issue-character-type.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-issue-character-type',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './issue-character-type.html',
  styleUrl: './issue-character-type.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueCharacterTypeComponent extends BaseListComponent implements OnInit, OnDestroy {
  issueCharacterTypes: IssueCharacterTypeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  isLocalUpdate: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private issueCharacterTypeService: IssueCharacterTypeService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Name', value: 'IssueCharacterType' },
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
    this.loading$ = this.store.select(selectIssueCharacterTypeLoading);
    this.totalCount$ = this.store.select(selectIssueCharacterTypeTotalCount);

    this.store.select(selectIssueCharacterTypeTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectIssueCharacterTypeTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllIssueCharacterTypes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.isLocalUpdate) return;
        this.issueCharacterTypes = data;
        console.log("Issue Character Types", this.issueCharacterTypes);
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

    console.log("Query Params IssueCharacterType", params);

    this.store.dispatch(IssueCharacterTypeActions.load({ queryParams: params }));
  }

  onDelete(item: IssueCharacterTypeModel) {
    this.confirmationService.confirmDelete(item.issueCharacterType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueCharacterTypeService.delete(item.issueCharacterTypeId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Character Type deleted successfully', 'Success');
                const index = this.issueCharacterTypes.findIndex(x => x.issueCharacterTypeId === item.issueCharacterTypeId);
                if (index !== -1) {
                  this.issueCharacterTypes[index] = {
                    ...this.issueCharacterTypes[index],
                    ...((res as any)?.data),
                    deletedUser: (res as any)?.data?.deletedUser || (res as any)?.data?.deletedBy,
                    deletedDate: (res as any)?.data?.deletedDate || new Date().toISOString(),
                    deleted: true
                  };
                  this.issueCharacterTypes = [...this.issueCharacterTypes];
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

  onRestore(item: IssueCharacterTypeModel) {
    this.confirmationService.confirmRestore(item.issueCharacterType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueCharacterTypeService.restore(item.issueCharacterTypeId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Character Type restored successfully', 'Success');
                const index = this.issueCharacterTypes.findIndex(x => x.issueCharacterTypeId === item.issueCharacterTypeId);
                if (index !== -1) {
                  this.issueCharacterTypes[index] = {
                    ...this.issueCharacterTypes[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    deleted: false
                  };
                  this.issueCharacterTypes = [...this.issueCharacterTypes];
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

  onSuspend(item: IssueCharacterTypeModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.issueCharacterType, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedIssueCharacterType = {
            active: status,
          }
          this.issueCharacterTypeService.update(item.issueCharacterTypeId, updatedIssueCharacterType).subscribe({
            next: (res) => {
              console.log("response", res);
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Issue Character Type ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                const index = this.issueCharacterTypes.findIndex(x => x.issueCharacterTypeId === item.issueCharacterTypeId);
                if (index !== -1) {
                  this.issueCharacterTypes[index] = {
                    ...this.issueCharacterTypes[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    active: status
                  };
                  this.issueCharacterTypes = [...this.issueCharacterTypes];
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
    const dialogRef = this.dialog.open(AddEditIssueCharacterTypeComponent, {
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
          this.issueCharacterTypes = [result.data, ...this.issueCharacterTypes];
          this.totalCount++;
          this.cdr.markForCheck();
          setTimeout(() => this.isLocalUpdate = false, 100);
        } else if (result.statusCode === 200) {
          // Replace specific index so it renders without reload
          const index = this.issueCharacterTypes.findIndex(x => x.issueCharacterTypeId === result.data.issueCharacterTypeId);
          if (index !== -1) {
            this.issueCharacterTypes[index] = { ...this.issueCharacterTypes[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  openEditDialog(item: IssueCharacterTypeModel) {
    const dialogRef = this.dialog.open(AddEditIssueCharacterTypeComponent, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        // Replace specific index so it renders without reload
        const index = this.issueCharacterTypes.findIndex(x => x.issueCharacterTypeId === result.data.issueCharacterTypeId);
        if (index !== -1) {
          this.issueCharacterTypes[index] = { ...this.issueCharacterTypes[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }
}
