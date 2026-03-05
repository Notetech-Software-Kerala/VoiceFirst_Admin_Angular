import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ProgramActionActions } from '../../core/_state/program-action/program-action.action';
import { ProgramActionModel } from '../../core/_state/program-action/program-action.model';
import {
  selectAllProgramActions,
  selectProgramActionLoading,
  selectProgramActionTotalCount,
  selectProgramActionTotalPages
} from '../../core/_state/program-action/program-action.selectors';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../material.module';
import { takeUntil, Observable } from 'rxjs';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { AddEditProgramActionComponent } from './add-edit-program-action/add-edit-program-action.component';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { ProgramActionService } from '../../core/_state/program-action/program-action.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { CommonModule } from '@angular/common';
import { BaseListComponent } from '../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-program-action',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './program-action.html',
  styleUrl: './program-action.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProgramAction extends BaseListComponent implements OnInit, OnDestroy {
  programActions: ProgramActionModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  isLocalUpdate: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private programActionService: ProgramActionService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Action Name', value: 'ActionName' },
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
        if (this.isLocalUpdate) return;
        this.programActions = data;
        console.log("Program Actions", this.programActions);
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  // Load data with current query parameters
  loadData() {
    if (!this.queryParams.SortBy) {
      this.queryParams.SortBy = "createdAt";
    }
    if (!this.queryParams.SortOrder) {
      this.queryParams.SortOrder = "Desc";
    }
    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Query Params ProgramAction", params);

    this.store.dispatch(ProgramActionActions.load({ queryParams: params }));
  }

  // Delete confirmation using shared service
  onDelete(item: ProgramActionModel) {
    this.confirmationService.confirmDelete(item.actionName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programActionService.delete(item.actionId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action deleted successfully', 'Success');
                const index = this.programActions.findIndex(x => x.actionId === item.actionId);
                if (index !== -1) {
                  this.programActions[index] = {
                    ...this.programActions[index],
                    ...((res as any)?.data),
                    deletedUser: (res as any)?.data?.deletedUser || (res as any)?.data?.deletedBy,
                    deletedDate: (res as any)?.data?.deletedDate || new Date().toISOString(),
                    deleted: true
                  };
                  this.programActions = [...this.programActions];
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

  onRestore(item: ProgramActionModel) {
    this.confirmationService.confirmRestore(item.actionName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programActionService.restore(item.actionId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action restored successfully', 'Success');
                const index = this.programActions.findIndex(x => x.actionId === item.actionId);
                if (index !== -1) {
                  this.programActions[index] = {
                    ...this.programActions[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    deleted: false
                  };
                  this.programActions = [...this.programActions];
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

  onSuspend(item: ProgramActionModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.actionName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedProgramAction = {
            active: status,
          }
          this.programActionService.update(item.actionId, updatedProgramAction).subscribe({
            next: (res) => {
              console.log("response", res);
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Program Action ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                const index = this.programActions.findIndex(x => x.actionId === item.actionId);
                if (index !== -1) {
                  this.programActions[index] = {
                    ...this.programActions[index],
                    ...((res as any)?.data),
                    modifiedUser: (res as any)?.data?.modifiedUser || (res as any)?.data?.modifiedBy,
                    modifiedDate: (res as any)?.data?.modifiedDate || new Date().toISOString(),
                    active: status
                  };
                  this.programActions = [...this.programActions];
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

  // Open add dialog
  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditProgramActionComponent, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.statusCode === 201) {
          this.isLocalUpdate = true;
          this.programActions = [result.data, ...this.programActions];
          this.totalCount++;
          this.cdr.markForCheck();
          setTimeout(() => this.isLocalUpdate = false, 100);
        } else if (result.statusCode === 200) {
          const index = this.programActions.findIndex(x => x.actionId === result.data.actionId);
          if (index !== -1) {
            this.programActions[index] = { ...this.programActions[index], ...result.data };
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  // Open edit dialog
  openEditDialog(item: ProgramActionModel) {
    const dialogRef = this.dialog.open(AddEditProgramActionComponent, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.programActions.findIndex(x => x.actionId === result.data.actionId);
        if (index !== -1) {
          this.programActions[index] = { ...this.programActions[index], ...result.data };
        }
        this.cdr.markForCheck();
      }
    });
  }
}

