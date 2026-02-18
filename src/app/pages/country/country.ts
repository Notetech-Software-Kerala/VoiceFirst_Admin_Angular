import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CountryModel } from '../../core/_state/country/country.model';
import { Observable, takeUntil } from 'rxjs';
import { FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { CountryService } from '../../core/_state/country/country.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { selectAllCountries, selectCountryLoading, selectCountryTotalCount, selectCountryTotalPages } from '../../core/_state/country/country.selectors';
import { CountryActions } from '../../core/_state/country/country.action';
import { SortableColumnDirective } from '../../partials/shared_directives/sortable-column';
import { AddEditCountry } from './add-edit-country/add-edit-country';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';
import { BaseListComponent } from '../../core/base/base-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../partials/shared_services/encryption.service';
import { FilterBy } from '../../partials/shared_modules/filter-by/filter-by';

@Component({
  selector: 'app-country',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './country.html',
  styleUrl: './country.css',
})
export class Country extends BaseListComponent implements OnInit, OnDestroy {
  countries: CountryModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private countryService: CountryService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Country', value: 'CountryName' },
      { label: 'Division 1', value: 'DivisionOne' },
      { label: 'Division 2', value: 'DivisionTwo' },
      { label: 'Division 3', value: 'DivisionThree' },
      { label: 'Dial Code', value: 'DialCode' },
      { label: 'ISO Code', value: 'IsoAlphaTwo' }
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
    this.loading$ = this.store.select(selectCountryLoading);
    this.totalCount$ = this.store.select(selectCountryTotalCount);

    // Subscribe to pagination metadata
    this.store.select(selectCountryTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectCountryTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllCountries)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.countries = data;
        console.log("Countries", this.countries);
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

    console.log("Query Params Country", params);

    this.store.dispatch(CountryActions.load({ queryParams: params }));
  }

  // Open add dialog
  openAddDialog() {
    const dialogRef = this.dialog.open(AddEditCountry, {
      width: '500px',
      disableClose: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.statusCode === 201) {
          // Add new item
          this.store.dispatch(CountryActions.add({ country: result.data }));
        } else if (result.statusCode === 200) {
          // Update existing item - use correct NgRx Entity format
          this.store.dispatch(CountryActions.update({
            country: {
              id: result.data.countryId,
              changes: result.data
            }
          }));
        }
      }
    });
  }

  // Open edit dialog
  openEditDialog(item: CountryModel) {
    const dialogRef = this.dialog.open(AddEditCountry, {
      width: '500px',
      disableClose: true,
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dispatch update action
        this.store.dispatch(CountryActions.update({
          country: {
            id: result.data.countryId,
            changes: result.data
          }
        }));
      }
    });
  }
}
