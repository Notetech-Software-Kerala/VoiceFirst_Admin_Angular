import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PostOfficeActions } from '../../../core/_state/post-office/post-office.action';
import { PostOfficeModel } from '../../../core/_state/post-office/post-office.model';
import { selectPostOfficeLoading, selectPostOfficeTotalCount, selectPostOfficeTotalPages, selectAllPostOffices } from '../../../core/_state/post-office/post-office.selectors';
import { PostOfficeService } from '../../../core/_state/post-office/post-office.service';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-office-details',
  imports: [CommonModule],
  templateUrl: './post-office-details.html',
  styleUrl: './post-office-details.css',
})
export class PostOfficeDetails extends BaseListComponent implements OnInit, OnDestroy {
  postOffices: PostOfficeModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  selectedPostOfficeId: number | '' = '';
  selectedPostOfficeName: string = '';
  searchSubject = new Subject<string>();

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
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      if (searchText && !this.queryParams?.SearchBy) {
        this.queryParams.SearchBy = 'PostOfficeName';
      }
      this.onSearch(searchText);
    });

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
      ...this.statusFilters
    };

    console.log("Query Params PostOffice", params);

    this.store.dispatch(PostOfficeActions.load({ queryParams: params }));
  }

  onPostOfficeSelectTrigger(postOffice: PostOfficeModel) {
    this.selectedPostOfficeId = postOffice.postOfficeId;
    this.selectedPostOfficeName = postOffice.postOfficeName;
  }

  onDropdownSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onPrevPage(event: Event) {
    event.stopPropagation();
    if (this.currentPage > 1) {
      this.onPaginationChange({ page: this.currentPage - 1, size: this.pageSize });
    }
  }

  onNextPage(event: Event) {
    event.stopPropagation();
    if (this.currentPage < this.totalPages) {
      this.onPaginationChange({ page: this.currentPage + 1, size: this.pageSize });
    }
  }
}
