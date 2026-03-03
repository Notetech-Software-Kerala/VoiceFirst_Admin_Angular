import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { Observable, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { selectAllPlaces, selectPlaceLoading, selectPlaceTotalCount, selectPlaceTotalPages } from '../../../core/_state/place/place.selectors';
import { PlaceActions } from '../../../core/_state/place/place.action';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../../../material.module';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy } from '../../../partials/shared_modules/filter-by/filter-by';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';

@Component({
  selector: 'app-place-list',
  imports: [
    CommonModule,
    SearchBar,
    Pagination,
    MaterialModule,
    MatProgressBarModule,
    FilterBy,
    SortableColumnDirective,
    StatusBadge
  ],
  templateUrl: './place-list.html',
  styleUrl: './place-list.css',
})
export class PlaceList extends BaseListComponent implements OnInit, OnDestroy {
  places: PlaceModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;
  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private placeService: PlaceService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService,
    protected override router: Router
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Place Name', value: 'PlaceName' },
      // { label: 'Created By', value: 'CreatedUser' },
      // { label: 'Updated By', value: 'UpdatedUser' },
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
    this.loading$ = this.store.select(selectPlaceLoading);
    this.totalCount$ = this.store.select(selectPlaceTotalCount);
    // Subscribe to pagination metadata
    this.store.select(selectPlaceTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectPlaceTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    // Subscribe to data
    this.store.select(selectAllPlaces)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.places = data;
        console.log(this.places);

        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);
    const params = {
      ...this.queryParams,
      ...this.statusFilters,
    };

    console.log("Place Query Params", params);
    this.store.dispatch(PlaceActions.load({ queryParams: params }));
  }


  onDelete(item: PlaceModel) {
    this.confirmationService.confirmDelete(item.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.delete(item.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place deleted successfully', 'Success');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      });
  }

  onRestore(item: PlaceModel) {
    this.confirmationService.confirmRestore(item.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.restore(item.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place restored successfully', 'Success');
                this.loadData();
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      });
  }

  onSuspend(item: PlaceModel) {
    const active = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.placeName, active)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const payload = {
            active: active
          }

          this.placeService.update(item.placeId, payload).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                const msg = active ? 'Suspended' : 'Reinstated';
                this.toastService.success(`Place ${msg} successfully`, 'Success');
                this.store.dispatch(PlaceActions.update({
                  place: { id: item.placeId, changes: { active: active } }
                }));
              } else {
                this.toastService.error(res.message);
              }
            },
            error: (err) => {
              console.error(err);

            }
          });
        }
      });
  }

  navigateToAdd() {
    this.router.navigate(['/place/add']);
  }

  navigateToEdit(item: PlaceModel) {
    this.router.navigate(['/place/edit', this.encryptionService.encryptForRoute(item.placeId)]);
  }

  navigateToDetails(item: PlaceModel) {
    this.router.navigate(['/place/details', this.encryptionService.encryptForRoute(item.placeId)]);
  }
}
