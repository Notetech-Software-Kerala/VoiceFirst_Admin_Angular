import { ChangeDetectorRef, Component } from '@angular/core';
import { CustomFieldModel } from '../../../core/_state/custom-field/custom-field.model';
import { Observable, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { CustomFieldService } from '../../../core/_state/custom-field/custom-field.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { selectAllCustomFields, selectCustomFieldLoading, selectCustomFieldTotalCount, selectCustomFieldTotalPages } from '../../../core/_state/custom-field/custom-field.selectors';
import { CustomFieldActions } from '../../../core/_state/custom-field/custom-field.actions';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../../partials/shared_modules/pagination/pagination';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { SortableColumnDirective } from '../../../partials/shared_directives/sortable-column';
import { FilterBy } from '../../../partials/shared_modules/filter-by/filter-by';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { BaseListComponent } from '../../../core/base/base-list.component';

@Component({
  selector: 'app-custom-field-list',
  imports: [SearchBar, Pagination, StatusBadge, SortableColumnDirective, MaterialModule, FilterBy, CommonModule],
  templateUrl: './custom-field-list.html',
  styleUrl: './custom-field-list.css',
})
export class CustomFieldList extends BaseListComponent {
  customFields: CustomFieldModel[] = [];
  loading$!: Observable<boolean>;
  totalCount$!: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public utilityService: UtilityService,
    private customFieldService: CustomFieldService,
    private toastService: ToastService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override encryptionService: EncryptionService
  ) {
    super(router, route, encryptionService, cdr);

    this.searchByOptions = [
      { label: 'Field Name', value: 'FieldName' },
      { label: 'Field Key', value: 'FieldKey' }
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
    this.loading$ = this.store.select(selectCustomFieldLoading);
    this.totalCount$ = this.store.select(selectCustomFieldTotalCount);

    this.store.select(selectCustomFieldTotalCount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.totalCount = count;
        this.cdr.markForCheck();
      });

    this.store.select(selectCustomFieldTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pages => {
        this.totalPages = pages;
        this.cdr.markForCheck();
      });

    this.store.select(selectAllCustomFields)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.customFields = data;
        this.cdr.markForCheck();
      });

    super.ngOnInit();
  }

  loadData() {
    this.utilityService.applyDefaultSorting(this.queryParams);

    const params = {
      ...this.queryParams,
      ...this.statusFilters
    };

    this.store.dispatch(CustomFieldActions.load({ queryParams: params }));
  }

  onDelete(item: CustomFieldModel) {
    this.confirmationService.confirmDelete(item.fieldName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.customFieldService.delete(item.customFieldId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Custom Field deleted successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onRestore(item: CustomFieldModel) {
    this.confirmationService.confirmRestore(item.fieldName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.customFieldService.restore(item.customFieldId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Custom Field restored successfully', 'Success');
                this.loadData();
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onSuspend(item: CustomFieldModel) {
    const status = item.active ? false : true;
    this.confirmationService.confirmSuspend(item.fieldName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedCustomFieldAction = {
            active: status,
          }
          this.customFieldService.update(item.customFieldId, updatedCustomFieldAction).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Custom Field ${item.active ? 'Suspended' : 'Reinstated'} successfully`, 'Success');
                this.store.dispatch(CustomFieldActions.update({
                  customField: {
                    id: item.customFieldId,
                    changes: updatedCustomFieldAction
                  }
                }));
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  navigateToAdd() {
    this.router.navigate(['/custom-field/add']);
  }

  navigateToEdit(item: CustomFieldModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.customFieldId);
    this.router.navigate(['/custom-field/edit', encryptedId]);
  }

  navigateToDetails(item: CustomFieldModel) {
    const encryptedId = this.encryptionService.encryptForRoute(item.customFieldId);
    this.router.navigate(['/custom-field/details', encryptedId]);
  }
}
