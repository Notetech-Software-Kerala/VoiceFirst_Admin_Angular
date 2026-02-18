import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, takeUntil } from 'rxjs';
import { ProgramActions } from '../../../core/_state/program/program.action';
import { ProgramModel } from '../../../core/_state/program/program.model';
import { selectProgramLoading, selectProgramTotalCount, selectProgramTotalPages, selectAllPrograms } from '../../../core/_state/program/program.selectors';
import { ProgramService } from '../../../core/_state/program/program.service';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy, FilterOption } from '../../../partials/shared_modules/filter-by/filter-by';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-program-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './program-list.html',
  styleUrl: './program-list.css',
})
export class ProgramList extends BaseListComponent implements OnInit, OnDestroy {
  programs: ProgramModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private programService: ProgramService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Program Name', value: 'ProgramName' },
      { label: 'Label', value: 'Label' },
      { label: 'Route', value: 'Route' },
      // { label: 'Platform', value: 'PlatformName' },
      // { label: 'Company', value: 'CompanyName' },
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
    this.loading$ = this.store.select(selectProgramLoading);
    this.totalCount$ = this.store.select(selectProgramTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectProgramTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectProgramTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllPrograms)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.programs = data;
        console.log("Programs", this.programs);
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  // Load data with current query parameters
  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);
    // Merge queryParams with statusFilters (Active/Delete)
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
      Limit: this.pageSize,
      PageNumber: this.currentPage
    };

    console.log("Query Params Program", params);

    this.store.dispatch(ProgramActions.load({ queryParams: params }));
  }

  // Delete confirmation using shared service
  onDelete(item: ProgramModel) {
    this.confirmationService.confirmDelete(item.programName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programService.delete(item.programId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action deleted successfully', 'Success');
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

  onRestore(item: ProgramModel) {
    this.confirmationService.confirmRestore(item.programName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programService.restore(item.programId).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success('Program Action deleted successfully', 'Success');
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

  onSuspend(item: ProgramModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.programName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedProgramAction = {
            active: status,
          }
          this.programService.update(item.programId, updatedProgramAction).subscribe({
            next: (res) => {
              console.log("response", res);
              if (res.statusCode === 200) {
                this.toastService.success(`Program Action ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                this.store.dispatch(ProgramActions.update({
                  program: {
                    id: item.programId,
                    changes: updatedProgramAction
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
  navigateToAdd() {
    this.router.navigate(['/program/add']);
  }

  // Open edit dialog
  navigateToEdit(item: ProgramModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.programId);
    this.router.navigate(['/program/edit', encryptedId]);
  }

  navigateToDetails(item: ProgramModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.programId);
    this.router.navigate(['/program/details', encryptedId]);
  }
}
