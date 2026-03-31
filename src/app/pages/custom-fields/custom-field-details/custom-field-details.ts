import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { CustomFieldService } from '../../../core/_state/custom-field/custom-field.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';

// Assuming actions might be available, otherwise we just manage local state.
// import { CustomFieldActions } from '../../../core/_state/custom-field/custom-field.action';

@Component({
  selector: 'app-custom-field-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './custom-field-details.html',
  styleUrl: './custom-field-details.css',
})
export class CustomFieldDetails implements OnInit, OnDestroy {
  field: any | null = null;

  get activeDataType() {
    return this.field?.fieldDataTypes?.length ? this.field.fieldDataTypes[0] : null;
  }

  loading = true;
  private destroy$ = new Subject<void>();
  customFieldId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customFieldService: CustomFieldService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private store: Store,
    private location: Location,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
        if (decryptedId) {
          this.customFieldId = +decryptedId;
          this.loadCustomFieldDetails(this.customFieldId);
        } else {
          this.toastService.error('Invalid Custom Field ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomFieldDetails(id: number) {
    this.loading = true;
    this.customFieldService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.statusCode === 200 && res.data) {
            this.field = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load custom field details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading custom field details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.field) {
      const encryptedId = this.encryptionService.encryptForRoute(this.field.customFieldId);
      this.router.navigate(['/custom-field/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.field) return;

    this.confirmationService.confirmDelete(this.field.fieldName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.customFieldService.delete(this.field!.customFieldId).subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                this.toastService.success('Custom Field deleted successfully', 'Success');
                this.field = res.data;
                // this.store.dispatch(CustomFieldActions.delete({ id: this.customFieldId }));
                this.goBack(); // Navigate back after delete
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onSuspend() {
    if (!this.field) return;

    const status = !this.field.active;
    const action = this.field.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.field.fieldName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.customFieldService.update(this.field!.customFieldId, changes).subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Custom Field ${action}ed successfully`, 'Success');

                // Update local state
                if (this.field) {
                  this.field = { ...this.field, active: status };
                }

                // this.store.dispatch(CustomFieldActions.update({ ... }));
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onRestore() {
    if (!this.field) return;

    this.confirmationService.confirmRestore(this.field.fieldName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          // Assuming method name is restore in service
          this.customFieldService.restore(this.customFieldId).subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                this.toastService.success('Custom Field recovered successfully', 'Success');
                this.loadCustomFieldDetails(this.customFieldId);
              }
            },
            error: (error) => { }
          })
        }
      });
  }
}
