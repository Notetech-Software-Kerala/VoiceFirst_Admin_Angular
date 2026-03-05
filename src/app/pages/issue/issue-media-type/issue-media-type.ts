import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueMediaTypeActions } from '../../../core/_state/issue/issue-media-type/issue-media-type.action';
import { IssueMediaTypeModel } from '../../../core/_state/issue/issue-media-type/issue-media-type.model';
import {
  selectAllIssueMediaTypes,
  selectIssueMediaTypeLoading,
  selectIssueMediaTypeTotalCount,
  selectIssueMediaTypeTotalPages
} from '../../../core/_state/issue/issue-media-type/issue-media-type.selectors';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { AddEditIssueMediaType } from './add-edit-issue-media-type/add-edit-issue-media-type';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { IssueMediaTypeService } from '../../../core/_state/issue/issue-media-type/issue-media-type.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-issue-media-type',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './issue-media-type.html',
  styleUrl: './issue-media-type.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueMediaTypeComponent extends BaseListComponent implements OnInit, OnDestroy {
  issueMediaTypes: IssueMediaTypeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private issueMediaTypeService: IssueMediaTypeService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Media Type', value: 'IssueMediaFormat' },
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
    this.loading$ = this.store.select(selectIssueMediaTypeLoading);
    this.totalCount$ = this.store.select(selectIssueMediaTypeTotalCount);

    this.store.select(selectIssueMediaTypeTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectIssueMediaTypeTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllIssueMediaTypes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.issueMediaTypes = data;
        console.log("Issue Media Types", this.issueMediaTypes);
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

    console.log("Query Params IssueMediaType", params);

    this.store.dispatch(IssueMediaTypeActions.load({ queryParams: params }));
  }

  onDelete(item: IssueMediaTypeModel) {
    this.confirmationService.confirmDelete(item.issueMediaFormat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueMediaTypeService.delete(item.issueMediaFormatId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Media Type deleted successfully', 'Success');
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

  onRestore(item: IssueMediaTypeModel) {
    this.confirmationService.confirmRestore(item.issueMediaFormat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueMediaTypeService.restore(item.issueMediaFormatId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Issue Media Type restored successfully', 'Success');
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

  onSuspend(item: IssueMediaTypeModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.issueMediaFormat, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedIssueMediaType = {
            active: status,
          }
          this.issueMediaTypeService.update(item.issueMediaFormatId, updatedIssueMediaType).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success(`Issue Media Type ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                this.store.dispatch(IssueMediaTypeActions.update({
                  issueMediaType: {
                    id: item.issueMediaFormatId,
                    changes: updatedIssueMediaType
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

  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditIssueMediaType, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        if (result.statusCode === 201) {
          // Prepend to array exactly so it renders without reload
          this.issueMediaTypes = [result.data, ...this.issueMediaTypes];
          this.totalCount++;
          this.cdr.markForCheck();
        } else if (result.statusCode === 200) {
          // Replace specific index so it renders without reload
          const index = this.issueMediaTypes.findIndex(x => x.issueMediaFormatId === result.data.issueMediaFormatId);
          if (index !== -1) {
            this.issueMediaTypes[index] = { ...this.issueMediaTypes[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  openEditDialog(item: IssueMediaTypeModel) {
    const dialogRef = this.dialog.open(AddEditIssueMediaType, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result in Parent:', result);
      if (result) {
        // Replace specific index so it renders without reload
        const index = this.issueMediaTypes.findIndex(x => x.issueMediaFormatId === result.data.issueMediaFormatId);
        if (index !== -1) {
          this.issueMediaTypes[index] = { ...this.issueMediaTypes[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }
}
